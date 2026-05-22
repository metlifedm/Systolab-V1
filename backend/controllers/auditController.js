const CoreAuditEngine = require('../services/audit/CoreAuditEngine');
const ReportGenerator = require('../services/report/ReportGenerator');
const ReportFormatter = require('../services/report/ReportFormatter');
const AuditReport = require('../models/AuditReport');
const AuditSignal = require('../models/AuditSignal');
const logger = require('../utils/logger');

class AuditController {
  /**
   * Execute complete audit with interpretation and scoring
   */
  async executeAudit(req, res, next) {
    const startTime = Date.now();
    
    try {
      const { validatedURL, validatedDomain, validatedGBP } = req;
      
      logger.info(`Full audit requested for: ${validatedURL}`);
      
      // Step 1: Execute Core Audit Engine
      const coreEngine = new CoreAuditEngine(validatedURL, validatedDomain);
      const auditResult = await coreEngine.execute();
      
      if (!auditResult.success) {
        return res.status(500).json({
          state: 'error',
          error: {
            message: 'Core audit execution failed',
            details: auditResult.errors
          }
        });
      }
      
      // Step 2: Create initial audit report
      const auditReport = new AuditReport({
        websiteUrl: validatedURL,
        gbpLink: validatedGBP || null,
        auditMode: 'pending', // Will be updated by ReportGenerator
        executionState: 'processing',
        executionDuration: auditResult.duration,
        crawlStats: auditResult.crawlStats,
        technicalNotes: auditResult.technicalNotes,
        errors: auditResult.errors
      });
      
      await auditReport.save();
      
      // Step 3: Save signals
      const signalIds = await coreEngine.saveSignals(auditReport._id);
      auditReport.signals = signalIds;
      await auditReport.save();
      
      // Step 4: Load signals for interpretation
      const signals = await AuditSignal.find({ auditId: auditReport._id });
      
      // Step 5: Generate complete report with interpretation and scoring
      const reportGenerator = new ReportGenerator(
        auditReport._id,
        validatedURL,
        validatedGBP,
        signals,
        auditResult
      );
      
      const reportResult = await reportGenerator.generate();
      
      if (!reportResult.success) {
        throw new Error('Report generation failed');
      }
      
      // Step 6: Format and return report
      const formattedReport = ReportFormatter.formatForAPI(reportResult.report);
      
      logger.info(`Complete audit ${auditReport._id} finished in ${Date.now() - startTime}ms`);
      
      res.json({
        state: 'success',
        data: formattedReport,
        execution: {
          totalDuration: Date.now() - startTime,
          crawlDuration: auditResult.duration
        }
      });
      
    } catch (error) {
      logger.error(`Audit execution error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get audit report by ID
   */
  async getAuditReport(req, res, next) {
    try {
      const { auditId } = req.params;
      
      const report = await AuditReport.findById(auditId)
        .populate('signals')
        .exec();
      
      if (!report) {
        return res.status(404).json({
          state: 'error',
          error: {
            message: 'Audit report not found',
            code: 'NOT_FOUND'
          }
        });
      }
      
      const formattedReport = ReportFormatter.formatForAPI(report);
      
      res.json({
        state: 'success',
        data: formattedReport
      });
      
    } catch (error) {
      logger.error(`Get audit error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get audit history for website
   */
  async getAuditHistory(req, res, next) {
    try {
      const { websiteUrl } = req.query;
      
      if (!websiteUrl) {
        return res.status(400).json({
          state: 'error',
          error: {
            message: 'Website URL is required',
            field: 'websiteUrl'
          }
        });
      }
      
      const reports = await AuditReport.find({ websiteUrl })
        .sort({ executionTimestamp: -1 })
        .limit(10)
        .select('-signals -technicalNotes -errors')
        .exec();
      
      res.json({
        state: 'success',
        data: {
          websiteUrl,
          auditCount: reports.length,
          audits: reports.map(report => ({
            auditId: report._id,
            executionTimestamp: report.executionTimestamp,
            auditMode: report.auditMode,
            overallScore: report.scores.overall.score,
            overallLevel: report.scores.overall.level,
            findingsCount: report.findings.length
          }))
        }
      });
      
    } catch (error) {
      logger.error(`Get history error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get findings grouped by category
   */
  async getFindingsByCategory(req, res, next) {
    try {
      const { auditId } = req.params;
      
      const report = await AuditReport.findById(auditId);
      
      if (!report) {
        return res.status(404).json({
          state: 'error',
          error: {
            message: 'Audit report not found',
            code: 'NOT_FOUND'
          }
        });
      }
      
      const grouped = {
        website_health: [],
        mobile_experience: [],
        trust_presence: [],
        visibility_structure: []
      };
      
      report.findings.forEach(finding => {
        if (grouped[finding.category]) {
          grouped[finding.category].push(finding);
        }
      });
      
      res.json({
        state: 'success',
        data: grouped
      });
      
    } catch (error) {
      logger.error(`Get findings error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new AuditController();