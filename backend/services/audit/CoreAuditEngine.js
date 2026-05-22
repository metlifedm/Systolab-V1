const CoreCrawler = require('../crawler/CoreCrawler');
const SignalExtractor = require('./SignalExtractor');
const SignalAnalyzer = require('./SignalAnalyzer');
const AuditSignal = require('../../models/AuditSignal');
const logger = require('../../utils/logger');
const config = require('../../config/environment');
const axios = require('axios');

class CoreAuditEngine {
  constructor(websiteUrl, domain) {
    this.websiteUrl = websiteUrl;
    this.domain = domain;
    this.crawlResult = null;
    this.allSignals = [];
    this.technicalNotes = [];
    this.errors = [];
  }

  /**
   * Execute complete core audit
   */
  async execute() {
    const startTime = Date.now();
    
    try {
      logger.info(`Starting core audit for: ${this.websiteUrl}`);
      
      // Step 1: Crawl website
      await this.crawlWebsite();
      
      // Step 2: Extract signals from all pages
      await this.extractSignals();
      
      // Step 3: Check additional resources (sitemap, robots.txt)
      await this.checkAdditionalResources();
      
      const duration = Date.now() - startTime;
      
      logger.info(`Core audit completed in ${duration}ms with ${this.allSignals.length} signals`);
      
      return {
        success: true,
        signals: this.allSignals,
        crawlStats: this.crawlResult?.stats || {},
        technicalNotes: this.technicalNotes,
        errors: this.errors,
        duration
      };
      
    } catch (error) {
      logger.error(`Core audit failed: ${error.message}`);
      
      this.errors.push({
        stage: 'core_audit',
        error: error.message,
        timestamp: new Date()
      });
      
      return {
        success: false,
        signals: this.allSignals,
        crawlStats: this.crawlResult?.stats || {},
        technicalNotes: this.technicalNotes,
        errors: this.errors,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Crawl website using CoreCrawler
   */
  async crawlWebsite() {
    try {
      const crawler = new CoreCrawler(this.websiteUrl, this.domain);
      this.crawlResult = await crawler.crawl();
      
      if (!this.crawlResult.success || this.crawlResult.pages.length === 0) {
        throw new Error('Website crawl failed or returned no pages');
      }
      
      // Add technical note if dynamic content warning needed
      const hasJavaScript = this.crawlResult.pages.some(page => 
        page.html && page.html.includes('<script')
      );
      
      if (hasJavaScript) {
        this.technicalNotes.push({
          type: 'limitation',
          message: 'SYSTOLAB analyzes publicly accessible static HTML structure. Some modern websites load content dynamically using JavaScript, which may affect signal detection and interpretation accuracy.'
        });
      }
      
    } catch (error) {
      logger.error(`Crawl failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract and analyze signals from all crawled pages
   */
  async extractSignals() {
    if (!this.crawlResult || !this.crawlResult.pages) {
      throw new Error('No crawled pages available for signal extraction');
    }
    
    for (const page of this.crawlResult.pages) {
      try {
        // Extract signals
        const extractor = new SignalExtractor(page);
        const extractedSignals = extractor.extractAll();
        
        // Analyze signals
        const analyzer = new SignalAnalyzer(extractedSignals, page);
        const analyzedSignals = analyzer.analyzeAll();
        
        // Add to collection
        this.allSignals.push(...analyzedSignals);
        
      } catch (error) {
        logger.error(`Signal extraction failed for ${page.url}: ${error.message}`);
        
        this.errors.push({
          stage: 'signal_extraction',
          url: page.url,
          error: error.message,
          timestamp: new Date()
        });
      }
    }
  }

  /**
   * Check for sitemap and robots.txt presence
   */
  async checkAdditionalResources() {
    // Check sitemap
    await this.checkSitemap();
    
    // Check robots.txt
    await this.checkRobotsTxt();
  }

  /**
   * Check sitemap presence
   */
  async checkSitemap() {
    const sitemapURLs = [
      `${this.websiteUrl}/sitemap.xml`,
      `${this.websiteUrl}/sitemap_index.xml`
    ];
    
    let sitemapFound = false;
    
    for (const url of sitemapURLs) {
      try {
        const response = await axios.head(url, {
          timeout: 5000,
          validateStatus: (status) => status === 200
        });
        
        if (response.status === 200) {
          sitemapFound = true;
          break;
        }
      } catch {
        // Continue checking
      }
    }
    
    if (!sitemapFound) {
      this.allSignals.push({
        signalType: 'sitemap_presence',
        status: 'missing',
        extractedValue: { checked: sitemapURLs },
        pageUrl: this.websiteUrl,
        pageType: 'homepage',
        category: 'visibility_structure',
        severity: 'medium',
        weight: 8,
        interpretation: {
          operationalImpact: 'No XML sitemap detected at standard location',
          businessConsequence: 'Search systems may take longer to discover all your pages',
          actionGuidance: 'Create and publish an XML sitemap at /sitemap.xml'
        }
      });
    }
  }

  /**
   * Check robots.txt presence
   */
  async checkRobotsTxt() {
    const robotsURL = `${this.websiteUrl}/robots.txt`;
    
    try {
      const response = await axios.head(robotsURL, {
        timeout: 5000,
        validateStatus: (status) => status === 200
      });
      
      if (response.status !== 200) {
        throw new Error('Not found');
      }
      
    } catch {
      this.allSignals.push({
        signalType: 'robots_txt_presence',
        status: 'missing',
        extractedValue: { url: robotsURL },
        pageUrl: this.websiteUrl,
        pageType: 'homepage',
        category: 'visibility_structure',
        severity: 'low',
        weight: 5,
        interpretation: {
          operationalImpact: 'No robots.txt file found',
          businessConsequence: 'Crawling systems lack guidance on which pages to access',
          actionGuidance: 'Create a robots.txt file to guide automated system behavior'
        }
      });
    }
  }

  /**
   * Save signals to database
   */
  async saveSignals(auditId) {
    try {
      const signalDocuments = this.allSignals.map(signal => ({
        auditId,
        ...signal,
        extractionTimestamp: new Date()
      }));
      
      const savedSignals = await AuditSignal.insertMany(signalDocuments);
      
      logger.info(`Saved ${savedSignals.length} signals to database`);
      
      return savedSignals.map(s => s._id);
      
    } catch (error) {
      logger.error(`Failed to save signals: ${error.message}`);
      throw error;
    }
  }
}

module.exports = CoreAuditEngine;