// backend/services/crawler/CoreCrawler.js

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { URL } = require('url');

const config = require('../../config/environment');
const logger = require('../../utils/logger');

const {
  isSameDomain,
  normalizeURL
} = require('../../utils/helpers');

const RobotsTxtParser = require('./RobotsTxtParser');

class CoreCrawler {

  constructor(baseURL, domain) {

    this.baseURL = baseURL;
    this.domain = domain;

    this.visitedURLs = new Set();

    this.discoveredURLs = new Set();

    this.crawledPages = [];

    this.errors = [];

    this.browser = null;

    this.robotsParser = null;

    this.stats = {
      pagesAnalyzed: 0,
      pagesSkipped: 0,
      pagesFailed: 0,
      totalRequests: 0,
      crawlDepth: 1
    };

    this.priorityPatterns = [
      'contact',
      'about',
      'company',
      'venue',
      'location',
      'support',
      'footer',
      'privacy',
      'terms'
    ];
  }

  /**
   * Initialize crawler
   */
  async initialize() {

    try {

      // robots.txt
      this.robotsParser = new RobotsTxtParser(
        this.baseURL
      );

      await this.robotsParser.fetch();

      // puppeteer
      this.browser = await puppeteer.launch({
        headless: true,

        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-extensions',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-features=site-per-process',
          '--disable-blink-features=AutomationControlled',
          '--single-process',
          '--no-zygote'
        ],

        executablePath:
          process.env.PUPPETEER_EXECUTABLE_PATH || undefined
      });

      logger.info(
        `Crawler initialized: ${this.domain}`
      );

    } catch (error) {

      logger.error(
        `Crawler initialization failed: ${error.message}`
      );

      throw error;
    }
  }

  /**
   * Main crawl execution
   */
  async crawl() {

    const startTime = Date.now();

    try {

      await this.initialize();

      // Crawl homepage first
      const homepage = await this.crawlPage(
        this.baseURL,
        'homepage'
      );

      if (homepage) {

        this.crawledPages.push(homepage);

        this.stats.pagesAnalyzed++;

        // Discover links
        const links = this.extractInternalLinks(
          homepage.html,
          this.baseURL
        );

        // Prioritize important pages
        const prioritizedLinks =
          this.prioritizeLinks(links);

        // Crawl max 20 pages
        const limit = Math.min(
          prioritizedLinks.length,
          20
        );

        for (let i = 0; i < limit; i++) {

          const url = prioritizedLinks[i];

          if (
            this.visitedURLs.has(
              normalizeURL(url)
            )
          ) {

            this.stats.pagesSkipped++;
            continue;
          }

          await this.delay(
            config.CRAWLER.REQUEST_DELAY
          );

          const page = await this.crawlPage(
            url,
            'internal'
          );

          if (page) {

            this.crawledPages.push(page);

            this.stats.pagesAnalyzed++;
          }
        }
      }

      const duration =
        Date.now() - startTime;

      logger.info(
        `Crawl completed:
        ${this.stats.pagesAnalyzed} pages analyzed`
      );

      await this.closeBrowser();

      return {
        success: true,
        pages: this.crawledPages,
        stats: this.stats,
        errors: this.errors,
        duration
      };

    } catch (error) {

      await this.closeBrowser();

      logger.error(
        `Crawler failed: ${error.message}`
      );

      return {
        success: false,
        pages: this.crawledPages,
        stats: this.stats,

        errors: [
          ...this.errors,
          {
            stage: 'crawl',
            error: error.message
          }
        ],

        duration:
          Date.now() - startTime
      };
    }
  }

  /**
   * Crawl single page using Puppeteer
   */
  async crawlPage(url, pageType = 'internal') {

    const normalizedURL =
      normalizeURL(url);

    // Already visited
    if (
      this.visitedURLs.has(
        normalizedURL
      )
    ) {
      return null;
    }

    // robots.txt compliance
    if (
      this.robotsParser &&
      !this.robotsParser.isAllowed(url)
    ) {

      logger.info(
        `Robots disallowed:
        ${url}`
      );

      this.stats.pagesSkipped++;

      return null;
    }

    this.visitedURLs.add(
      normalizedURL
    );

    this.stats.totalRequests++;

    try {

      logger.info(
        `Crawling page:
        ${url}`
      );

      const page =
        await this.browser.newPage();

      await page.setViewport({
        width: 1366,
        height: 768
      });

      await page.setUserAgent(
        config.CRAWLER.USER_AGENT
      );

      await page.setExtraHTTPHeaders({
        'accept-language':
          'en-US,en;q=0.9'
      });

      // Block heavy assets
      await page.setRequestInterception(true);

      page.on(
        'request',
        request => {

          const type =
            request.resourceType();

          if (
            [
              'image',
              'media',
              'font'
            ].includes(type)
          ) {

            request.abort();

          } else {

            request.continue();
          }
        }
      );

      // Open page
      const response =
        await page.goto(url, {

          waitUntil: 'networkidle2',

          timeout:
            config.CRAWLER.TIMEOUT_PER_URL
        });

      // Wait extra hydration
      await new Promise(resolve =>
        setTimeout(resolve, 4000)
      );

      // Extract rendered HTML
      const html =
        await page.content();

      // Extract metadata
      const title =
        await page.title();

      const finalURL =
        page.url();

      // Content type
      const headers =
        response.headers();

      const contentType =
        headers['content-type'] || '';

      if (
        !contentType.includes(
          'text/html'
        )
      ) {

        logger.warn(
          `Skipped non-html:
          ${url}`
        );

        this.stats.pagesSkipped++;

        await page.close();

        return null;
      }

      // Extract footer
      const footerText =
        await page.evaluate(() => {

          const footer =
            document.querySelector(
              'footer'
            );

          return footer
            ? footer.innerText
            : '';
        });

      // Extract socials
      const socialLinks =
        await page.evaluate(() => {

          const anchors =
            Array.from(
              document.querySelectorAll('a')
            );

          return anchors
            .map(a => a.href)
            .filter(
              href =>
                href.includes('instagram') ||
                href.includes('facebook') ||
                href.includes('linkedin') ||
                href.includes('twitter') ||
                href.includes('x.com') ||
                href.includes('youtube')
            );
        });

      await page.close();

      return {
        url,
        normalizedURL,
        pageType,

        statusCode:
          response.status(),

        title,

        html,

        headers,

        footerText,

        socialLinks,

        finalURL,

        crawledAt:
          new Date()
      };

    } catch (error) {

      logger.warn(
        `Failed crawling ${url}:
        ${error.message}`
      );

      this.errors.push({
        url,
        error: error.message,
        timestamp: new Date()
      });

      this.stats.pagesFailed++;

      return null;
    }
  }

  /**
   * Extract internal links
   */
  extractInternalLinks(
    html,
    baseURL
  ) {

    try {

      const $ = cheerio.load(html);

      const links = new Set();

      $('a[href]').each(
        (i, element) => {

          try {

            const href =
              $(element).attr('href');

            if (
              !href ||
              href.startsWith('#') ||
              href.startsWith('mailto:') ||
              href.startsWith('tel:')
            ) {
              return;
            }

            const absoluteURL =
              new URL(
                href,
                baseURL
              ).href;

            if (
              isSameDomain(
                absoluteURL,
                baseURL
              )
            ) {

              links.add(
                absoluteURL
              );
            }

          } catch { }
        }
      );

      return Array.from(links);

    } catch (error) {

      logger.error(
        `Link extraction failed:
        ${error.message}`
      );

      return [];
    }
  }

  /**
   * Prioritize important URLs
   */
  prioritizeLinks(links) {

    return links.sort((a, b) => {

      const aPriority =
        this.priorityPatterns.some(
          pattern =>
            a.toLowerCase()
              .includes(pattern)
        );

      const bPriority =
        this.priorityPatterns.some(
          pattern =>
            b.toLowerCase()
              .includes(pattern)
        );

      return bPriority - aPriority;
    });
  }

  /**
   * Delay helper
   */
  delay(ms) {

    return new Promise(resolve =>
      setTimeout(resolve, ms)
    );
  }

  /**
   * Cleanup browser
   */
  async closeBrowser() {

    try {

      if (this.browser) {

        await this.browser.close();
      }

    } catch (error) {

      logger.warn(
        `Browser cleanup failed:
        ${error.message}`
      );
    }
  }

  /**
   * Summary
   */
  getSummary() {

    return {
      baseURL: this.baseURL,
      domain: this.domain,
      stats: this.stats,

      pagesAnalyzed:
        this.crawledPages.length,

      errorCount:
        this.errors.length
    };
  }
}

module.exports = CoreCrawler;