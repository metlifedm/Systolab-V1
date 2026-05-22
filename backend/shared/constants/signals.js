// Comprehensive Signal Definitions with Operational Weights and Categories

module.exports = {
  SIGNAL_DEFINITIONS: {
    
    // === WEBSITE HEALTH SIGNALS ===
    PAGE_TITLE: {
      signalType: 'page_title',
      category: 'website_health',
      severity: 'high',
      weight: 12,
      description: 'Page title clarity and presence',
      interpretations: {
        missing: {
          operationalImpact: 'Page lacks a defined title element',
          businessConsequence: 'Visitors and indexing systems cannot quickly understand page purpose',
          actionGuidance: 'Add a clear, descriptive title to every page that explains its purpose'
        },
        partial: {
          operationalImpact: 'Page title is present but may lack clarity or descriptive value',
          businessConsequence: 'Page purpose may not be immediately clear to visitors',
          actionGuidance: 'Review title text for clarity and ensure it accurately describes page content'
        }
      }
    },
    
    META_DESCRIPTION: {
      signalType: 'meta_description',
      category: 'website_health',
      severity: 'medium',
      weight: 8,
      description: 'Meta description presence and quality',
      interpretations: {
        missing: {
          operationalImpact: 'Page lacks a meta description element',
          businessConsequence: 'Search listings may display inconsistent or unclear page summaries',
          actionGuidance: 'Add a concise meta description that summarizes page content in 150-160 characters'
        }
      }
    },
    
    HEADING_HIERARCHY: {
      signalType: 'heading_hierarchy',
      category: 'website_health',
      severity: 'medium',
      weight: 10,
      description: 'Logical heading structure (H1, H2, H3)',
      interpretations: {
        inconsistent: {
          operationalImpact: 'Page heading structure is inconsistent or missing logical hierarchy',
          businessConsequence: 'Content may be difficult to scan and understand quickly',
          actionGuidance: 'Organize content using clear heading levels (H1 for main title, H2 for sections, H3 for subsections)'
        },
        missing: {
          operationalImpact: 'Page lacks proper heading elements',
          businessConsequence: 'Visitors cannot quickly navigate or understand content structure',
          actionGuidance: 'Add heading tags to organize content into scannable sections'
        }
      }
    },
    
    IMAGE_ALT_COVERAGE: {
      signalType: 'image_alt_coverage',
      category: 'website_health',
      severity: 'medium',
      weight: 7,
      description: 'Image alt attribute coverage',
      interpretations: {
        partial: {
          operationalImpact: 'Some images lack alternative text descriptions',
          businessConsequence: 'Screen reader users and systems cannot understand image content',
          actionGuidance: 'Add descriptive alt text to all meaningful images'
        }
      }
    },
    
    INTERNAL_LINKING: {
      signalType: 'internal_linking',
      category: 'website_health',
      severity: 'low',
      weight: 6,
      description: 'Internal linking consistency',
      interpretations: {
        partial: {
          operationalImpact: 'Internal navigation structure may be incomplete',
          businessConsequence: 'Visitors may struggle to discover related content',
          actionGuidance: 'Ensure important pages are linked from multiple relevant locations'
        }
      }
    },
    
    // === MOBILE EXPERIENCE SIGNALS ===
    MOBILE_VIEWPORT: {
      signalType: 'mobile_viewport',
      category: 'mobile_experience',
      severity: 'high',
      weight: 15,
      description: 'Mobile viewport configuration',
      interpretations: {
        missing: {
          operationalImpact: 'Mobile viewport meta tag is not configured',
          businessConsequence: 'Mobile visitors may experience unreadable text and awkward page scaling',
          actionGuidance: 'Add viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">'
        }
      }
    },
    
    // === TRUST PRESENCE SIGNALS ===
    HTTPS_STATUS: {
      signalType: 'https_status',
      category: 'trust_presence',
      severity: 'critical',
      weight: 20,
      description: 'HTTPS security status',
      interpretations: {
        missing: {
          operationalImpact: 'Website is not using HTTPS encryption',
          businessConsequence: 'Browsers display "Not Secure" warnings, reducing visitor trust and confidence',
          actionGuidance: 'Install an SSL certificate and enforce HTTPS across all pages'
        }
      }
    },
    
    EMAIL_VISIBILITY: {
      signalType: 'email_visibility',
      category: 'trust_presence',
      severity: 'medium',
      weight: 9,
      description: 'Email contact visibility',
      interpretations: {
        missing: {
          operationalImpact: 'No email address found on analyzed pages',
          businessConsequence: 'Visitors may struggle to initiate contact or trust legitimacy',
          actionGuidance: 'Display a clear contact email address on your contact page or footer'
        }
      }
    },
    
    PHONE_VISIBILITY: {
      signalType: 'phone_visibility',
      category: 'trust_presence',
      severity: 'medium',
      weight: 9,
      description: 'Phone number visibility',
      interpretations: {
        missing: {
          operationalImpact: 'No phone number found on analyzed pages',
          businessConsequence: 'Visitors preferring phone contact may leave without connecting',
          actionGuidance: 'Display your business phone number prominently, especially on contact pages'
        }
      }
    },
    
    ADDRESS_VISIBILITY: {
      signalType: 'address_visibility',
      category: 'trust_presence',
      severity: 'low',
      weight: 7,
      description: 'Physical address visibility',
      interpretations: {
        missing: {
          operationalImpact: 'No physical address found on analyzed pages',
          businessConsequence: 'Local customers may not understand where you are located',
          actionGuidance: 'If you have a physical location, display your full address clearly'
        }
      }
    },
    
    SOCIAL_PROFILES: {
      signalType: 'social_profiles',
      category: 'trust_presence',
      severity: 'low',
      weight: 5,
      description: 'Social profile references',
      interpretations: {
        missing: {
          operationalImpact: 'No social media profile links detected',
          businessConsequence: 'Visitors cannot verify business presence or connect via social channels',
          actionGuidance: 'Link to active social media profiles in your website footer or contact page'
        }
      }
    },
    
    // === VISIBILITY STRUCTURE SIGNALS ===
    SITEMAP_PRESENCE: {
      signalType: 'sitemap_presence',
      category: 'visibility_structure',
      severity: 'medium',
      weight: 8,
      description: 'XML sitemap availability',
      interpretations: {
        missing: {
          operationalImpact: 'No XML sitemap detected at standard location',
          businessConsequence: 'Search systems may take longer to discover all your pages',
          actionGuidance: 'Create and publish an XML sitemap at /sitemap.xml'
        }
      }
    },
    
    ROBOTS_TXT_PRESENCE: {
      signalType: 'robots_txt_presence',
      category: 'visibility_structure',
      severity: 'low',
      weight: 5,
      description: 'Robots.txt file availability',
      interpretations: {
        missing: {
          operationalImpact: 'No robots.txt file found',
          businessConsequence: 'Crawling systems lack guidance on which pages to access',
          actionGuidance: 'Create a robots.txt file to guide automated system behavior'
        }
      }
    },
    
    SCHEMA_MARKUP: {
      signalType: 'schema_markup',
      category: 'visibility_structure',
      severity: 'medium',
      weight: 10,
      description: 'Structured data (schema) presence',
      interpretations: {
        missing: {
          operationalImpact: 'No structured data markup detected',
          businessConsequence: 'Search systems cannot understand your business type, location, or services',
          actionGuidance: 'Add schema.org structured data (Organization, LocalBusiness) to help systems understand your business'
        },
        partial: {
          operationalImpact: 'Some structured data present but may be incomplete',
          businessConsequence: 'Business information may not be fully interpretable by indexing systems',
          actionGuidance: 'Review and complete your schema markup with all relevant business details'
        }
      }
    },
    
    STRUCTURAL_CONSISTENCY: {
      signalType: 'structural_consistency',
      category: 'visibility_structure',
      severity: 'low',
      weight: 6,
      description: 'Overall structural consistency',
      interpretations: {
        inconsistent: {
          operationalImpact: 'Page structure varies inconsistently across analyzed pages',
          businessConsequence: 'Visitors may find navigation and information discovery unpredictable',
          actionGuidance: 'Standardize layout, navigation, and information placement across all pages'
        }
      }
    }
  },
  
  // Signal type enumeration for validation
  SIGNAL_TYPES: [
    'page_title',
    'meta_description',
    'heading_hierarchy',
    'image_alt_coverage',
    'internal_linking',
    'mobile_viewport',
    'https_status',
    'sitemap_presence',
    'robots_txt_presence',
    'schema_markup',
    'social_profiles',
    'email_visibility',
    'phone_visibility',
    'address_visibility',
    'structural_consistency',
    'discoverability'
  ]
};