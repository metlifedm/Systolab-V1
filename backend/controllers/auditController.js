const CoreAuditEngine = require('../services/audit/CoreAuditEngine');
const AuditReport = require('../models/AuditReport');
const logger = require('../utils/logger');

class AuditController {
  /**
   * Execute new audit
   */
  async executeAudit(req, res, next) {
    const startTime = Date.now();
    
    try {
      const { validatedURL, validatedDomain } = req;
      
      logger.info(`Audit requested for: ${validatedURL}`);
      
      // Execute Core Audit Engine
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
      
      // Create initial audit report (without scoring yet - Step 3)
      const auditReport = new AuditReport({
        websiteUrl: validatedURL,
        gbpLink: req.validatedGBP || null,
        auditMode: 'website_only', // Will be updated in Step 3
        executionState: 'partial',
        executionDuration: auditResult.duration,
        crawlStats: auditResult.crawlStats,
        technicalNotes: auditResult.technicalNotes,
        errors: auditResult.errors
      });
      
      await auditReport.save();
      
      // Save signals with audit reference
      const signalIds = await coreEngine.saveSignals(auditReport._id);
      auditReport.signals = signalIds;
      await auditReport.save();
      
      logger.info(`Audit ${auditReport._id} created successfully`);
      
      // Return preliminary response (full interpretation in Step 3)
      res.json({
        state: 'success',
        auditId: auditReport._id,
        message: 'Core audit completed. Proceeding to interpretation.',
        data: {
          websiteUrl: validatedURL,
          signalsExtracted: signalIds.length,
          crawlStats: auditResult.crawlStats,
          duration: Date.now() - startTime
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
      
      res.json({
        state: 'success',
        data: report
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
        .select('-signals -technicalNotes')
        .exec();
      
      res.json({
        state: 'success',
        data: {
          websiteUrl,
          auditCount: reports.length,
          audits: reports
        }
      });
      
    } catch (error) {
      logger.error(`Get history error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new AuditController();