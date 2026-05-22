const { URL } = require('url');

module.exports = {
  /**
   * Normalize URL for consistent comparison
   */
  normalizeURL(url) {
    try {
      const urlObj = new URL(url);
      // Remove trailing slash, convert to lowercase
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`.replace(/\/$/, '').toLowerCase();
    } catch {
      return url;
    }
  },
  
  /**
   * Check if URL belongs to same domain
   */
  isSameDomain(url1, url2) {
    try {
      const domain1 = new URL(url1).hostname.toLowerCase();
      const domain2 = new URL(url2).hostname.toLowerCase();
      return domain1 === domain2;
    } catch {
      return false;
    }
  },
  
  /**
   * Extract domain from URL
   */
  extractDomain(url) {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return null;
    }
  },
  
  /**
   * Safely parse JSON
   */
  safeJSONParse(str, defaultValue = null) {
    try {
      return JSON.parse(str);
    } catch {
      return defaultValue;
    }
  },
  
  /**
   * Calculate execution duration
   */
  calculateDuration(startTime) {
    return Date.now() - startTime;
  },
  
  /**
   * Create slug from text
   */
  createSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
  
  /**
   * Safely truncate text
   */
  truncate(text, maxLength = 100, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length).trim() + suffix;
  }
};