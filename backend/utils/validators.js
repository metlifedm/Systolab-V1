const validator = require('validator');

module.exports = {
  /**
   * Validate and normalize website URL
   */
  validateWebsiteURL(url) {
    if (!url || typeof url !== 'string') {
      return { valid: false, error: 'URL is required' };
    }
    
    const trimmed = url.trim();
    
    if (trimmed.length === 0) {
      return { valid: false, error: 'URL cannot be empty' };
    }
    
    if (trimmed.length > 2048) {
      return { valid: false, error: 'URL exceeds maximum length' };
    }
    
    // Add protocol if missing
    let normalized = trimmed;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }
    
    // Validate URL format
    if (!validator.isURL(normalized, { 
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true
    })) {
      return { valid: false, error: 'Invalid URL format' };
    }
    
    // Extract and validate domain
    try {
      const urlObj = new URL(normalized);
      
      // Block localhost and private IPs
      const hostname = urlObj.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname === '::1'
      ) {
        return { valid: false, error: 'Local and private URLs are not supported' };
      }
      
      return { valid: true, normalized, domain: hostname };
      
    } catch (error) {
      return { valid: false, error: 'Invalid URL structure' };
    }
  },
  
  /**
   * Validate optional GBP link
   */
  validateGBPLink(url) {
    if (!url || url.trim().length === 0) {
      return { valid: true, normalized: null }; // Optional field
    }
    
    const trimmed = url.trim();
    
    if (!validator.isURL(trimmed, { require_protocol: false })) {
      return { valid: false, error: 'Invalid GBP link format' };
    }
    
    // Add protocol if missing
    let normalized = trimmed;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }
    
    // Basic Google Business Profile URL pattern validation
    try {
      const urlObj = new URL(normalized);
      const hostname = urlObj.hostname.toLowerCase();
      
      if (!hostname.includes('google.com')) {
        return { valid: false, error: 'GBP link must be a Google domain URL' };
      }
      
      return { valid: true, normalized };
      
    } catch (error) {
      return { valid: false, error: 'Invalid GBP link structure' };
    }
  },
  
  /**
   * Validate email address
   */
  isValidEmail(email) {
    return validator.isEmail(email);
  },
  
  /**
   * Extract and validate phone number patterns
   */
  extractPhoneNumbers(text) {
    // Basic phone number pattern matching
    const phonePatterns = [
      /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      /\d{3}-\d{3}-\d{4}/g,
      /\(\d{3}\)\s?\d{3}-\d{4}/g
    ];
    
    const found = new Set();
    
    phonePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => found.add(match.trim()));
      }
    });
    
    return Array.from(found);
  }
};