const GBPExtractor = require('./GBPExtractor');
const WebsiteContextExtractor = require('./WebsiteContextExtractor');
const logger = require('../../utils/logger');

class BusinessContextLayer {
  constructor(websiteUrl, gbpLink = null, crawlResult) {
    this.websiteUrl = websiteUrl;
    this.gbpLink = gbpLink;
    this.crawlResult = crawlResult;
    this.context = null;
    this.mode = null;
  }

  /**
   * Extract business context using available sources
   */
  async extract() {
    try {
      // Priority 1: Try GBP link if provided
      if (this.gbpLink) {
        logger.info('Attempting to extract GBP context');
        const gbpContext = await this.extractFromGBP();
        
        if (gbpContext && gbpContext.success) {
          this.context = gbpContext.data;
          this.mode = 'with_gbp_context';
          logger.info('Business context extracted from GBP');
          return this.buildContextResult();
        }
      }
      
      // Priority 2: Extract from website signals
      logger.info('Attempting to extract website-derived context');
      const websiteContext = await this.extractFromWebsite();
      
      if (websiteContext && websiteContext.hasContext) {
        this.context = websiteContext.data;
        this.mode = 'website_derived_context';
        logger.info('Business context derived from website');
        return this.buildContextResult();
      }
      
      // Priority 3: Website-only mode (no business context)
      logger.info('No business context available - proceeding in website-only mode');
      this.mode = 'website_only';
      this.context = null;
      
      return this.buildContextResult();
      
    } catch (error) {
      logger.error(`Business context extraction failed: ${error.message}`);
      this.mode = 'website_only';
      this.context = null;
      return this.buildContextResult();
    }
  }

  /**
   * Extract context from Google Business Profile
   */
  async extractFromGBP() {
    try {
      const extractor = new GBPExtractor(this.gbpLink);
      const result = await extractor.extract();
      return result;
    } catch (error) {
      logger.warn(`GBP extraction failed: ${error.message}`);
      return { success: false };
    }
  }

  /**
   * Extract context from website signals
   */
  async extractFromWebsite() {
    try {
      const extractor = new WebsiteContextExtractor(this.crawlResult);
      const result = await extractor.extract();
      return result;
    } catch (error) {
      logger.warn(`Website context extraction failed: ${error.message}`);
      return { hasContext: false };
    }
  }

  /**
   * Build standardized context result
   */
  buildContextResult() {
    return {
      mode: this.mode,
      hasContext: this.context !== null,
      context: this.context,
      metadata: {
        gbpLinkProvided: !!this.gbpLink,
        gbpExtractionSuccessful: this.mode === 'with_gbp_context',
        websiteContextAvailable: this.mode === 'website_derived_context'
      }
    };
  }

  /**
   * Get business context for report
   */
  getContextForReport() {
    if (!this.context) {
      return {
        hasGBPData: false,
        derivedFromWebsite: false
      };
    }

    if (this.mode === 'with_gbp_context') {
      return {
        hasGBPData: true,
        businessName: this.context.businessName,
        businessCategory: this.context.category,
        hasRating: this.context.hasRating,
        hasReviews: this.context.hasReviews,
        contactConsistency: this.assessContactConsistency(),
        derivedFromWebsite: false
      };
    }

    if (this.mode === 'website_derived_context') {
      return {
        hasGBPData: false,
        businessName: this.context.businessName,
        businessCategory: this.context.category,
        derivedFromWebsite: true,
        organizationSchema: this.context.organizationSchema,
        structuredContact: this.context.structuredContact
      };
    }

    return {
      hasGBPData: false,
      derivedFromWebsite: false
    };
  }

  /**
   * Assess contact information consistency (GBP vs Website)
   */
  assessContactConsistency() {
    // This is a placeholder for future enhancement
    // Would compare GBP contact info with website contact info
    return null;
  }
}

module.exports = BusinessContextLayer;