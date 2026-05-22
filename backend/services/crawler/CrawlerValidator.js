const { validateWebsiteURL } = require('../../utils/validators');
const logger = require('../../utils/logger');

class CrawlerValidator {
  /**
   * Validate crawl input parameters
   */
  static validateCrawlRequest(websiteUrl) {
    const validation = validateWebsiteURL(websiteUrl);
    
    if (!validation.valid) {
      logger.warn(`Crawl validation failed: ${validation.error}`);
      return {
        valid: false,
        error: validation.error
      };
    }
    
    return {
      valid: true,
      url: validation.normalized,
      domain: validation.domain
    };
  }

  /**
   * Validate crawled page result
   */
  static validatePageResult(pageResult) {
    if (!pageResult) {
      return { valid: false, error: 'No page result' };
    }
    
    if (!pageResult.html || pageResult.html.length === 0) {
      return { valid: false, error: 'Empty HTML content' };
    }
    
    if (pageResult.statusCode < 200 || pageResult.statusCode >= 400) {
      return { valid: false, error: `Invalid status code: ${pageResult.statusCode}` };
    }
    
    return { valid: true };
  }

  /**
   * Sanitize HTML content
   */
  static sanitizeHTML(html) {
    if (typeof html !== 'string') return '';
    
    // Remove script and style content for cleaner analysis
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  }
}

module.exports = CrawlerValidator;