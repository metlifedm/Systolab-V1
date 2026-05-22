module.exports = {
  // Operational Response States
  RESPONSE_STATES: {
    SUCCESS: 'success',
    PARTIAL: 'partial',
    ERROR: 'error'
  },
  
  // Audit Execution Modes
  AUDIT_MODES: {
    WEBSITE_ONLY: 'website_only',
    WITH_GBP_CONTEXT: 'with_gbp_context',
    WEBSITE_DERIVED_CONTEXT: 'website_derived_context'
  },
  
  // Operational Categories
  CATEGORIES: {
    WEBSITE_HEALTH: 'website_health',
    MOBILE_EXPERIENCE: 'mobile_experience',
    TRUST_PRESENCE: 'trust_presence',
    VISIBILITY_STRUCTURE: 'visibility_structure'
  },
  
  // Severity Levels
  SEVERITY_LEVELS: {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    INFO: 'info'
  },
  
  // HTTP Status Categories
  HTTP_STATUS: {
    SUCCESS: [200, 201, 202, 203, 204, 205, 206],
    REDIRECT: [301, 302, 303, 307, 308],
    CLIENT_ERROR: [400, 401, 403, 404, 405, 406, 407, 408, 409, 410],
    SERVER_ERROR: [500, 501, 502, 503, 504, 505]
  },
  
  // Timeout Settings
  TIMEOUTS: {
    SINGLE_REQUEST: 10000,
    TOTAL_AUDIT: 60000,
    GBP_EXTRACTION: 8000
  }
};