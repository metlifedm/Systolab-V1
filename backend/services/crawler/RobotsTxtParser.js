const axios = require('axios');
const robotsParser = require('robots-parser');
const logger = require('../../utils/logger');
const config = require('../../config/environment');

class RobotsTxtParser {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.robotsURL = new URL('/robots.txt', baseURL).href;
    this.parser = null;
    this.exists = false;
  }

  /**
   * Fetch and parse robots.txt
   */
  async fetch() {
    try {
      const response = await axios.get(this.robotsURL, {
        timeout: 5000,
        headers: {
          'User-Agent': config.CRAWLER.USER_AGENT
        },
        validateStatus: (status) => status === 200
      });
      
      this.parser = robotsParser(this.robotsURL, response.data);
      this.exists = true;
      
      logger.debug(`Robots.txt fetched successfully from ${this.robotsURL}`);
      
      return true;
      
    } catch (error) {
      logger.debug(`Robots.txt not found or inaccessible: ${this.robotsURL}`);
      this.exists = false;
      return false;
    }
  }

  /**
   * Check if URL is allowed to be crawled
   */
  isAllowed(url, userAgent = config.CRAWLER.USER_AGENT) {
    if (!this.parser) {
      // If no robots.txt, assume allowed
      return true;
    }
    
    return this.parser.isAllowed(url, userAgent);
  }

  /**
   * Check if robots.txt exists
   */
  robotsExists() {
    return this.exists;
  }

  /**
   * Get sitemap URLs from robots.txt
   */
  getSitemaps() {
    if (!this.parser) return [];
    
    try {
      return this.parser.getSitemaps() || [];
    } catch {
      return [];
    }
  }
}

module.exports = RobotsTxtParser;