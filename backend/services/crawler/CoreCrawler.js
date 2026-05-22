const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const config = require('../../config/environment');
const logger = require('../../utils/logger');
const { isSameDomain, normalizeURL } = require('../../utils/helpers');
const RobotsTxtParser = require('./RobotsTxtParser');

class CoreCrawler {
  constructor(baseURL, domain) {
    this.baseURL = baseURL;
    this.domain = domain;
    this.visitedURLs = new Set();
    this.discoveredURLs = new Set();
    this.crawledPages = [];
    this.errors = [];
    this.robotsParser = null;
    
    this.stats = {
      pagesAnalyzed: 0,
      pagesSkipped: 0,
      pagesFailed: 0,
      totalRequests: 0,
      crawlDepth: 1
    };
  }

  /**
   * Initialize crawler and check robots.txt compliance
   */
  async initialize() {
    try {
      this.robotsParser = new RobotsTxtParser(this.baseURL);
      await this.robotsParser.fetch();
      logger.info(`Crawler initialized for domain: ${this.domain}`);
    } catch (error) {
      logger.warn(`Failed to fetch robots.txt: ${error.message}`);
      // Continue without robots.txt - non-blocking
    }
  }

  /**
   * Execute full crawl process
   */
  async crawl() {
    const startTime = Date.now();
    
    try {
      await this.initialize();
      
      // Always crawl homepage first
      const homepageResult = await this.crawlPage(this.baseURL, 'homepage');
      
      if (homepageResult) {
        this.crawledPages.push(homepageResult);
        this.stats.pagesAnalyzed++;
        
        // Extract internal links for discovery crawling
        const internalLinks = this.extractInternalLinks(homepageResult.html, this.baseURL);
        
        // Crawl up to 5 additional discovery pages
        const discoveryLimit = Math.min(internalLinks.length, 5);
        
        for (let i = 0; i < discoveryLimit; i++) {
          const url = internalLinks[i];
          
          // Skip if already visited
          if (this.visitedURLs.has(normalizeURL(url))) {
            this.stats.pagesSkipped++;
            continue;
          }
          
          // Throttle requests
          await this.delay(config.CRAWLER.REQUEST_DELAY);
          
          const pageResult = await this.crawlPage(url, 'internal');
          
          if (pageResult) {
            this.crawledPages.push(pageResult);
            this.stats.pagesAnalyzed++;
          }
        }
      }
      
      const duration = Date.now() - startTime;
      
      logger.info(`Crawl completed: ${this.stats.pagesAnalyzed} pages analyzed in ${duration}ms`);
      
      return {
        success: true,
        pages: this.crawledPages,
        stats: this.stats,
        errors: this.errors,
        duration
      };
      
    } catch (error) {
      logger.error(`Crawl failed: ${error.message}`);
      
      return {
        success: false,
        pages: this.crawledPages,
        stats: this.stats,
        errors: [...this.errors, { stage: 'crawl', error: error.message }],
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Crawl individual page with timeout and error handling
   */
  async crawlPage(url, pageType = 'internal') {
    const normalizedURL = normalizeURL(url);
    
    // Check if already visited
    if (this.visitedURLs.has(normalizedURL)) {
      return null;
    }
    
    // Check robots.txt compliance
    if (this.robotsParser && !this.robotsParser.isAllowed(url)) {
      logger.info(`Robots.txt disallows crawling: ${url}`);
      this.stats.pagesSkipped++;
      return null;
    }
    
    this.visitedURLs.add(normalizedURL);
    this.stats.totalRequests++;
    
    try {
      logger.debug(`Crawling: ${url}`);
      
      const response = await axios.get(url, {
        timeout: config.CRAWLER.TIMEOUT_PER_URL,
        maxRedirects: config.CRAWLER.MAX_REDIRECT_COUNT,
        headers: {
          'User-Agent': config.CRAWLER.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        validateStatus: (status) => status >= 200 && status < 400,
        maxContentLength: config.LIMITS.MAX_RESPONSE_SIZE
      });
      
      // Verify content type is HTML
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('text/html')) {
        logger.warn(`Non-HTML content type: ${contentType} for ${url}`);
        this.stats.pagesSkipped++;
        return null;
      }
      
      return {
        url,
        normalizedURL,
        pageType,
        statusCode: response.status,
        html: response.data,
        headers: response.headers,
        finalURL: response.request.res.responseUrl || url,
        crawledAt: new Date()
      };
      
    } catch (error) {
      const errorMessage = error.code === 'ECONNABORTED' 
        ? 'Request timeout' 
        : error.message;
      
      logger.warn(`Failed to crawl ${url}: ${errorMessage}`);
      
      this.errors.push({
        url,
        error: errorMessage,
        timestamp: new Date()
      });
      
      this.stats.pagesFailed++;
      
      return null;
    }
  }

  /**
   * Extract internal links from HTML
   */
  extractInternalLinks(html, baseURL) {
    try {
      const $ = cheerio.load(html);
      const links = new Set();
      
      $('a[href]').each((i, element) => {
        try {
          const href = $(element).attr('href');
          
          if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return;
          }
          
          // Resolve relative URLs
          const absoluteURL = new URL(href, baseURL).href;
          
          // Only include same-domain links
          if (isSameDomain(absoluteURL, baseURL)) {
            links.add(absoluteURL);
          }
          
        } catch (error) {
          // Invalid URL, skip
        }
      });
      
      return Array.from(links);
      
    } catch (error) {
      logger.error(`Failed to extract links: ${error.message}`);
      return [];
    }
  }

  /**
   * Delay helper for request throttling
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get crawl summary
   */
  getSummary() {
    return {
      baseURL: this.baseURL,
      domain: this.domain,
      stats: this.stats,
      pagesAnalyzed: this.crawledPages.length,
      errorCount: this.errors.length
    };
  }
}

module.exports = CoreCrawler;