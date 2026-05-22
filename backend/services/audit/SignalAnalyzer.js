const { SIGNAL_DEFINITIONS } = require('../../../shared/constants/signals');
const logger = require('../../utils/logger');

class SignalAnalyzer {
  constructor(extractedSignals, pageResult) {
    this.extractedSignals = extractedSignals;
    this.pageResult = pageResult;
    this.analyzedSignals = [];
  }

  /**
   * Analyze all extracted signals and create operational findings
   */
  analyzeAll() {
    // Website Health Signals
    this.analyzePageTitle();
    this.analyzeMetaDescription();
    this.analyzeHeadingHierarchy();
    this.analyzeImageAltCoverage();
    this.analyzeInternalLinking();
    
    // Mobile Experience Signals
    this.analyzeMobileViewport();
    
    // Trust Presence Signals
    this.analyzeHTTPSStatus();
    this.analyzeEmailVisibility();
    this.analyzePhoneVisibility();
    this.analyzeAddressVisibility();
    this.analyzeSocialProfiles();
    
    // Visibility Structure Signals
    this.analyzeSchemaMarkup();
    
    return this.analyzedSignals;
  }

  /**
   * Create analyzed signal object
   */
  createSignal(signalType, status, extractedValue = null) {
    const definition = SIGNAL_DEFINITIONS[signalType.toUpperCase()];
    
    if (!definition) {
      logger.warn(`Signal definition not found for: ${signalType}`);
      return null;
    }
    
    const interpretation = definition.interpretations?.[status] || {
      operationalImpact: 'Signal analyzed',
      businessConsequence: 'Impact assessed',
      actionGuidance: 'Review signal details'
    };
    
    return {
      signalType: definition.signalType,
      status,
      extractedValue,
      pageUrl: this.pageResult.url,
      pageType: this.pageResult.pageType,
      category: definition.category,
      severity: definition.severity,
      weight: definition.weight,
      interpretation
    };
  }

  /**
   * Analyze page title
   */
  analyzePageTitle() {
    const { pageTitle } = this.extractedSignals;
    
    if (!pageTitle.present || pageTitle.quality === 'missing') {
      this.analyzedSignals.push(
        this.createSignal('page_title', 'missing', pageTitle)
      );
    } else if (pageTitle.quality === 'too_short' || pageTitle.quality === 'too_long') {
      this.analyzedSignals.push(
        this.createSignal('page_title', 'partial', pageTitle)
      );
    }
    // If quality is 'good', no signal is created (passes)
  }

  /**
   * Analyze meta description
   */
  analyzeMetaDescription() {
    const { metaDescription } = this.extractedSignals;
    
    if (!metaDescription.present || metaDescription.quality === 'missing') {
      this.analyzedSignals.push(
        this.createSignal('meta_description', 'missing', metaDescription)
      );
    }
  }

  /**
   * Analyze heading hierarchy
   */
  analyzeHeadingHierarchy() {
    const { headingHierarchy } = this.extractedSignals;
    
    if (!headingHierarchy.present || headingHierarchy.quality === 'missing') {
      this.analyzedSignals.push(
        this.createSignal('heading_hierarchy', 'missing', headingHierarchy)
      );
    } else if (headingHierarchy.quality === 'missing_h1' || headingHierarchy.quality === 'multiple_h1') {
      this.analyzedSignals.push(
        this.createSignal('heading_hierarchy', 'inconsistent', headingHierarchy)
      );
    }
  }

  /**
   * Analyze image alt coverage
   */
  analyzeImageAltCoverage() {
    const { imageAltCoverage } = this.extractedSignals;
    
    if (imageAltCoverage.totalImages > 0 && imageAltCoverage.quality !== 'excellent') {
      const status = imageAltCoverage.quality === 'poor' ? 'partial' : 'partial';
      this.analyzedSignals.push(
        this.createSignal('image_alt_coverage', status, imageAltCoverage)
      );
    }
  }

  /**
   * Analyze internal linking
   */
  analyzeInternalLinking() {
    const { internalLinking } = this.extractedSignals;
    
    if (internalLinking.quality === 'limited') {
      this.analyzedSignals.push(
        this.createSignal('internal_linking', 'partial', internalLinking)
      );
    }
  }

  /**
   * Analyze mobile viewport
   */
  analyzeMobileViewport() {
    const { mobileViewport } = this.extractedSignals;
    
    if (!mobileViewport.present || mobileViewport.quality === 'missing') {
      this.analyzedSignals.push(
        this.createSignal('mobile_viewport', 'missing', mobileViewport)
      );
    }
  }

  /**
   * Analyze HTTPS status
   */
  analyzeHTTPSStatus() {
    const { httpsStatus } = this.extractedSignals;
    
    if (!httpsStatus.present || httpsStatus.quality === 'insecure') {
      this.analyzedSignals.push(
        this.createSignal('https_status', 'missing', httpsStatus)
      );
    }
  }

  /**
   * Analyze email visibility
   */
  analyzeEmailVisibility() {
    const { emailVisibility } = this.extractedSignals;
    
    if (!emailVisibility.present) {
      this.analyzedSignals.push(
        this.createSignal('email_visibility', 'missing', emailVisibility)
      );
    }
  }

  /**
   * Analyze phone visibility
   */
  analyzePhoneVisibility() {
    const { phoneVisibility } = this.extractedSignals;
    
    if (!phoneVisibility.present) {
      this.analyzedSignals.push(
        this.createSignal('phone_visibility', 'missing', phoneVisibility)
      );
    }
  }

  /**
   * Analyze address visibility
   */
  analyzeAddressVisibility() {
    const { addressVisibility } = this.extractedSignals;
    
    if (!addressVisibility.present) {
      this.analyzedSignals.push(
        this.createSignal('address_visibility', 'missing', addressVisibility)
      );
    }
  }

  /**
   * Analyze social profiles
   */
  analyzeSocialProfiles() {
    const { socialProfiles } = this.extractedSignals;
    
    if (!socialProfiles.present) {
      this.analyzedSignals.push(
        this.createSignal('social_profiles', 'missing', socialProfiles)
      );
    }
  }

  /**
   * Analyze schema markup
   */
  analyzeSchemaMarkup() {
    const { schemaMarkup } = this.extractedSignals;
    
    if (!schemaMarkup.present) {
      this.analyzedSignals.push(
        this.createSignal('schema_markup', 'missing', schemaMarkup)
      );
    } else if (!schemaMarkup.hasOrganization && !schemaMarkup.hasLocalBusiness) {
      this.analyzedSignals.push(
        this.createSignal('schema_markup', 'partial', schemaMarkup)
      );
    }
  }
}

module.exports = SignalAnalyzer;