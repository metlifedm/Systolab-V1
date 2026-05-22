const InterpretationEngine = require('../interpretation/InterpretationEngine');
const BusinessContextLayer = require('../context/BusinessContextLayer');
const AuditReport = require('../../models/AuditReport');
const logger = require('../../utils/logger');

class ReportGenerator {
  constructor(auditId, websiteUrl, gbpLink, signals, crawlResult) {
    this.auditId = auditId;
    this.websiteUrl = websiteUrl;
    this.gbpLink = gbpLink;
    this.signals = signals;
    this.crawlResult = crawlResult;
  }

  /**
   * Generate complete audit report
   */
  async generate() {
    try {
      logger.info(`Generating report for audit: ${this.auditId}`);
      
      // Extract business context - PASS crawlResult correctly
      const contextLayer = new BusinessContextLayer(
        this.websiteUrl,
        this.gbpLink,
        this.crawlResult  // This should be the full crawlResult object with pages array
      );
      const contextResult = await contextLayer.extract();
      
      // Run interpretation engine
      const interpretationEngine = new InterpretationEngine(
        this.signals,
        contextResult
      );
      const interpretation = await interpretationEngine.interpret();
      
      // Update audit report with complete data
      const report = await this.updateAuditReport(
        contextResult,
        interpretation
      );
      
      logger.info(`Report generation completed for audit: ${this.auditId}`);
      
      return {
        success: true,
        report
      };
      
    } catch (error) {
      logger.error(`Report generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update audit report with interpretation results
   */
  async updateAuditReport(contextResult, interpretation) {
    try {
      const report = await AuditReport.findById(this.auditId);
      
      if (!report) {
        throw new Error('Audit report not found');
      }
      
      // Update audit mode
      report.auditMode = contextResult.mode;
      
      // Update execution state
      report.executionState = 'success';
      
      // Update business context
      report.businessContext = this.formatBusinessContext(contextResult);
      
      // Update scores
      report.scores = {
        websiteHealth: interpretation.scores.websitehealth,
        mobileExperience: interpretation.scores.mobileexperience,
        trustPresence: interpretation.scores.trustpresence,
        visibilityStructure: interpretation.scores.visibilitystructure,
        overall: interpretation.scores.overall
      };
      
      // Update findings
      report.findings = interpretation.findings;
      
      // Update summary
      report.summary = interpretation.summary;
      
      // Add context insights as technical notes
      if (interpretation.contextInsights) {
        interpretation.contextInsights.forEach(insight => {
          report.technicalNotes.push({
            type: insight.type,
            message: insight.message
          });
        });
      }
      
      await report.save();
      
      return report;
      
    } catch (error) {
      logger.error(`Failed to update audit report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Format business context for report
   */
  formatBusinessContext(contextResult) {
    if (!contextResult.hasContext || !contextResult.context) {
      return {
        hasGBPData: false,
        derivedFromWebsite: false
      };
    }

    if (contextResult.mode === 'with_gbp_context') {
      const ctx = contextResult.context;
      return {
        hasGBPData: true,
        businessName: ctx.businessName || null,
        businessCategory: ctx.category || null,
        hasRating: ctx.hasRating || false,
        hasReviews: ctx.hasReviews || false,
        ratingValue: ctx.ratingValue || null,
        reviewCount: ctx.reviewCount || null,
        contactConsistency: null, // Future enhancement
        derivedFromWebsite: false
      };
    }

    if (contextResult.mode === 'website_derived_context') {
      const ctx = contextResult.context;
      return {
        hasGBPData: false,
        businessName: ctx.businessName || null,
        businessCategory: ctx.category || null,
        derivedFromWebsite: true,
        organizationSchema: ctx.organizationSchema || null,
        structuredContact: ctx.structuredContact || null
      };
    }

    return {
      hasGBPData: false,
      derivedFromWebsite: false
    };
  }
}

module.exports = ReportGenerator;