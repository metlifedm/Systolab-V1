const cheerio = require('cheerio');
const logger = require('../../utils/logger');
const puppeteer = require('puppeteer');

class GBPExtractor {
  constructor(gbpLink) {
    this.gbpLink = gbpLink;
  }

  /**
   * Extract publicly visible GBP information
   */
  async extract() {
    let browser;

    try {
      logger.info(`Starting GBP extraction: ${this.gbpLink}`);

      browser = await puppeteer.launch({
        headless: "new",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled'
        ]
      });

      const page = await browser.newPage();

      // Realistic browser headers
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      );

      await page.setViewport({
        width: 1366,
        height: 768
      });

      await page.setExtraHTTPHeaders({
        'accept-language': 'en-US,en;q=0.9'
      });

      logger.info('Opening Google Business Profile page');

      await page.goto(this.gbpLink, {
        waitUntil: 'networkidle2',
        timeout: 45000
      });

      // Wait for dynamic rendering
      await new Promise(resolve => setTimeout(resolve, 7000));

      const pageTitle = await page.title();

      logger.info(`GBP Page Title: ${pageTitle}`);

      const html = await page.content();

      logger.info(`GBP HTML Length: ${html.length}`);

      const $ = cheerio.load(html);

      const businessData = this.extractBusinessData($, html);

      await browser.close();

      logger.info(
        `GBP extraction completed: ${businessData.businessName || 'No business found'}`
      );

      if (!businessData.businessName) {
        return {
          success: false,
          reason: 'No business name extracted'
        };
      }

      return {
        success: true,
        data: businessData
      };

    } catch (error) {

      if (browser) {
        await browser.close();
      }

      logger.error(`GBP Puppeteer Error: ${error.message}`);

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract GBP data from rendered HTML
   */
  extractBusinessData($, html) {

    const data = {
      businessName: null,
      category: null,
      hasRating: false,
      hasReviews: false,
      ratingValue: null,
      reviewCount: null,
      address: null,
      phone: null,
      website: null,
      hours: null
    };

    try {

      // =====================================================
      // BUSINESS NAME
      // =====================================================

      const ogTitle =
        $('meta[property="og:title"]')
          .attr('content')
          ?.replace(' - Google Maps', '')
          .trim();

      const h1Title =
        $('h1').first().text().trim();

      const pageTitle =
        $('title')
          .text()
          .replace(' - Google Maps', '')
          .trim();

      if (
        ogTitle &&
        ogTitle.toLowerCase() !== 'google maps'
      ) {
        data.businessName = ogTitle;

      } else if (
        h1Title &&
        h1Title.toLowerCase() !== 'google maps'
      ) {
        data.businessName = h1Title;

      } else if (
        pageTitle &&
        pageTitle.toLowerCase() !== 'google maps'
      ) {
        data.businessName = pageTitle;

      } else {
        data.businessName = null;
      }

      // =====================================================
      // CATEGORY
      // =====================================================

      data.category =
        $('button[class*="DkEaL"]')
          .first()
          .text()
          .trim()

        ||

        $('[jsaction*="category"]')
          .first()
          .text()
          .trim()

        ||

        null;

      // =====================================================
      // FULL TEXT EXTRACTION
      // =====================================================

      const fullText = $('body').text();

      // =====================================================
      // RATING
      // =====================================================

      const ratingMatch =
        fullText.match(/(\d\.\d)\s*\(/);

      if (ratingMatch) {
        data.hasRating = true;
        data.ratingValue = parseFloat(ratingMatch[1]);
      }

      // =====================================================
      // REVIEW COUNT
      // =====================================================

      const reviewMatch =
        fullText.match(/(\d[\d,]*)\s*reviews/i);

      if (reviewMatch) {
        data.hasReviews = true;
        data.reviewCount = parseInt(
          reviewMatch[1].replace(/,/g, '')
        );
      }

      // =====================================================
      // PHONE
      // =====================================================

      const phoneLink =
        $('a[href^="tel:"]')
          .first()
          .attr('href');

      if (phoneLink) {
        data.phone = phoneLink
          .replace('tel:', '')
          .trim();
      }

      // fallback phone extraction
      if (!data.phone) {

        const phoneMatch = fullText.match(
          /(\+?\d[\d\s\-\(\)]{7,})/
        );

        if (phoneMatch) {
          data.phone = phoneMatch[1].trim();
        }
      }

      // =====================================================
      // WEBSITE
      // =====================================================

      const websiteLink =
        $('a[data-item-id*="authority"]')
          .first()
          .attr('href');

      if (websiteLink) {
        data.website = websiteLink;
      }

      // fallback website extraction
      if (!data.website) {

        const urls =
          html.match(/https?:\/\/[^"]+/g) || [];

        const filtered = urls.find(
          url =>
            !url.includes('google') &&
            !url.includes('gstatic') &&
            !url.includes('googleusercontent')
        );

        if (filtered) {
          data.website = filtered;
        }
      }

      // =====================================================
      // ADDRESS
      // =====================================================

      const addressElement =
        $('[data-item-id="address"]')
          .first();

      if (addressElement.length) {

        data.address =
          addressElement.text().trim()

          ||

          addressElement
            .attr('aria-label')
            ?.trim()

          ||

          null;
      }

      // fallback address extraction
      if (!data.address) {

        const addressMatch = fullText.match(
          /\d+.*(?:Road|Rd|Street|St|Avenue|Ave|Boulevard|Blvd|Lane|Ln|Drive|Dr|Mumbai|Florida|New York|California)/i
        );

        if (addressMatch) {
          data.address = addressMatch[0];
        }
      }

      // =====================================================
      // JSON-LD EXTRACTION
      // =====================================================

      $('script[type="application/ld+json"]').each(
        (i, elem) => {

          try {

            const jsonData =
              JSON.parse($(elem).html());

            // BUSINESS NAME
            if (
              jsonData.name &&
              !data.businessName
            ) {
              data.businessName =
                jsonData.name;
            }

            // PHONE
            if (
              jsonData.telephone &&
              !data.phone
            ) {
              data.phone =
                jsonData.telephone;
            }

            // WEBSITE
            if (
              jsonData.url &&
              !data.website
            ) {
              data.website =
                jsonData.url;
            }

            // ADDRESS
            if (
              jsonData.address &&
              !data.address
            ) {

              if (
                typeof jsonData.address === 'string'
              ) {

                data.address =
                  jsonData.address;

              } else {

                data.address =
                  `${jsonData.address.streetAddress || ''},
                   ${jsonData.address.addressLocality || ''},
                   ${jsonData.address.addressRegion || ''}`
                    .replace(/\s+/g, ' ')
                    .trim();
              }
            }

          } catch (error) {
            // skip invalid json
          }
        }
      );

      logger.info(
        `GBP Extracted:
        Name=${data.businessName}
        Category=${data.category}
        Rating=${data.ratingValue}
        Reviews=${data.reviewCount}`
      );

    } catch (error) {

      logger.warn(
        `Error extracting GBP fields: ${error.message}`
      );
    }

    return data;
  }

  /**
   * Validate GBP completeness
   */
  validateData(data) {

    const requiredFields = ['businessName'];

    const missing =
      requiredFields.filter(
        field => !data[field]
      );

    return {
      valid: missing.length === 0,
      missingFields: missing,
      completeness:
        this.calculateCompleteness(data)
    };
  }

  /**
   * Calculate profile completeness
   */
  calculateCompleteness(data) {

    const fields = [
      'businessName',
      'category',
      'hasRating',
      'hasReviews',
      'address',
      'phone',
      'website'
    ];

    const completed =
      fields.filter(field => {

        const value = data[field];

        return (
          value !== null &&
          value !== false &&
          value !== ''
        );

      }).length;

    return Math.round(
      (completed / fields.length) * 100
    );
  }
}

module.exports = GBPExtractor;