const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../../utils/logger');
const config = require('../../config/environment');

class GBPExtractor {
  constructor(gbpLink) {
    this.gbpLink = gbpLink;
  }

  /**
   * Extract publicly visible GBP information
   */
  async extract() {
    try {
      logger.debug(`Extracting GBP data from: ${this.gbpLink}`);
      
      const response = await axios.get(this.gbpLink, {
        timeout: config.TIMEOUTS.GBP_EXTRACTION,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        validateStatus: (status) => status === 200
      });

      const $ = cheerio.load(response.data);
      
      // Extract business information from public GBP page structure
      const businessData = this.extractBusinessData($);
      
      if (!businessData.businessName) {
        logger.warn('Failed to extract business name from GBP link');
        return { success: false };
      }

      logger.info(`GBP extraction successful for: ${businessData.businessName}`);
      
      return {
        success: true,
        data: businessData
      };
      
    } catch (error) {
      logger.warn(`GBP extraction error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract business data from GBP HTML structure
   */
  extractBusinessData($) {
    // Note: Google's structure changes frequently
    // This is a simplified extraction focused on publicly visible elements
    
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

    // Extract business name (multiple potential selectors)
    data.businessName = 
      $('h1[class*="fontHeadlineLarge"]').first().text().trim() ||
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      null;

    // Extract category
    data.category = 
      $('button[class*="DkEaL"]').first().text().trim() ||
      null;

    // Extract rating information
    const ratingText = $('div[class*="fontBodyMedium"] span[role="img"]').attr('aria-label') || '';
    if (ratingText.includes('stars')) {
      data.hasRating = true;
      const ratingMatch = ratingText.match(/(\d+\.?\d*)\s+stars?/);
      if (ratingMatch) {
        data.ratingValue = parseFloat(ratingMatch[1]);
      }
    }

    // Extract review count
    const reviewText = $('div[class*="fontBodyMedium"]').text();
    const reviewMatch = reviewText.match(/(\d+)\s+reviews?/i);
    if (reviewMatch) {
      data.hasReviews = true;
      data.reviewCount = parseInt(reviewMatch[1]);
    }

    // Extract address (from structured data or visible text)
    const addressSchema = $('script[type="application/ld+json"]').text();
    if (addressSchema) {
      try {
        const schema = JSON.parse(addressSchema);
        if (schema.address) {
          data.address = typeof schema.address === 'string' 
            ? schema.address 
            : `${schema.address.streetAddress}, ${schema.address.addressLocality}, ${schema.address.addressRegion}`;
        }
      } catch {
        // Schema parsing failed
      }
    }

    // Extract phone
    const phoneLink = $('a[href^="tel:"]').attr('href');
    if (phoneLink) {
      data.phone = phoneLink.replace('tel:', '');
    }

    // Extract website
    const websiteLink = $('a[data-item-id*="authority"]').attr('href');
    if (websiteLink) {
      data.website = websiteLink;
    }

    return data;
  }

  /**
   * Validate extracted GBP data completeness
   */
  validateData(data) {
    const requiredFields = ['businessName'];
    const missing = requiredFields.filter(field => !data[field]);
    
    return {
      valid: missing.length === 0,
      missingFields: missing,
      completeness: this.calculateCompleteness(data)
    };
  }

  /**
   * Calculate GBP profile completeness percentage
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
    
    const completed = fields.filter(field => {
      const value = data[field];
      return value !== null && value !== false && value !== '';
    }).length;
    
    return Math.round((completed / fields.length) * 100);
  }
}

module.exports = GBPExtractor;