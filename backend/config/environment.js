require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/systolab',
  
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Crawler Configuration
  CRAWLER: {
    MAX_PAGES: 6, // Homepage + 5 discovery pages
    TIMEOUT_PER_URL: 10000, // 10 seconds
    REQUEST_DELAY: 500, // 500ms between requests
    USER_AGENT: 'SYSTOLAB-Audit-Bot/1.0 (Operational Diagnostic Platform)',
    MAX_RETRIES: 2,
    FOLLOW_REDIRECTS: true,
    MAX_REDIRECT_COUNT: 3
  },
  
  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 10 // Max 10 audits per window
  },
  
  // System Limits
  LIMITS: {
    MAX_CRAWL_DEPTH: 2,
    MAX_RESPONSE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_URL_LENGTH: 2048
  },
  
  // Timeout Settings (ADDED - This was missing)
  TIMEOUTS: {
    SINGLE_REQUEST: 10000,
    TOTAL_AUDIT: 60000,
    GBP_EXTRACTION: 8000
  }
};