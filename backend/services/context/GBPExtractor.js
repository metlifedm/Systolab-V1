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
      
      // Check if config.TIMEOUTS exists
      const timeout = config.TIMEOUTS?.GBP_EXTRACTION || 8000;
      
      const response = await axios.get(this.gbpLink, {
        timeout: timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        validateStatus: (status) => status === 200,
        maxRedirects: 5
      });

      const $ = cheerio.load(response.data);
      
      // Extract business information from public GBP page structure
      const businessData = this.extractBusinessData($);
      
      if (!businessData.businessName) {
        logger.warn('Failed to extract business name from GBP link');
        return { success: false, reason: 'No business name found' };
      }

      logger.info(`GBP extraction successful for: ${businessData.businessName}`);
      
      return {
        success: true,
        data: businessData
      };
      
    } catch (error) {
      logger.warn(`GBP extraction error: ${error.message}`);
      return { 
        success: false, 
        error: error.message,
        reason: 'Network or parsing error'
      };
    }
  }

  /**
   * Extract business data from GBP HTML structure
   */
  extractBusinessData($) {
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
      // Try multiple selectors for business name
      data.businessName = 
        $('h1[class*="DUwDvf"]').first().text().trim() ||
        $('h1.fontHeadlineLarge').first().text().trim() ||
        $('h1').first().text().trim() ||
        $('meta[property="og:title"]').attr('content')?.replace(' - Google Maps', '').trim() ||
        $('title').text().replace(' - Google Maps', '').trim() ||
        null;

      // Extract category
      data.category = 
        $('button[class*="DkEaL"]').first().text().trim() ||
        $('[jsaction*="category"]').first().text().trim() ||
        null;

      // Extract rating information
      const ratingText = $('div[class*="fontBodyMedium"]').first().text();
      const ratingMatch = ratingText.match(/(\d+\.?\d*)\s*★/);
      if (ratingMatch) {
        data.hasRating = true;
        data.ratingValue = parseFloat(ratingMatch[1]);
      }

      // Extract review count
      const reviewMatch = ratingText.match(/(\d+(?:,\d+)*)\s+reviews?/i);
      if (reviewMatch) {
        data.hasReviews = true;
        data.reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''));
      }

      // Extract phone (look for tel: links)
      const phoneLink = $('a[href^="tel:"]').first().attr('href');
      if (phoneLink) {
        data.phone = phoneLink.replace('tel:', '').trim();
      }

      // Extract website (look for data-item-id="authority")
      const websiteLink = $('a[data-item-id*="authority"]').first().attr('href');
      if (websiteLink) {
        data.website = websiteLink;
      }

      // Extract address from aria-label or data attributes
      const addressElement = $('[data-item-id="address"]').first();
      if (addressElement.length) {
        data.address = addressElement.text().trim() || 
                      addressElement.attr('aria-label')?.trim() ||
                      null;
      }

      // Try to get address from JSON-LD if present
      $('script[type="application/ld+json"]').each((i, elem) => {
        try {
          const jsonData = JSON.parse($(elem).html());
          if (jsonData['@type'] === 'LocalBusiness' && jsonData.address && !data.address) {
            if (typeof jsonData.address === 'string') {
              data.address = jsonData.address;
            } else if (jsonData.address.streetAddress) {
              data.address = `${jsonData.address.streetAddress}, ${jsonData.address.addressLocality || ''}, ${jsonData.address.addressRegion || ''}`.trim();
            }
          }
          
          if (jsonData.name && !data.businessName) {
            data.businessName = jsonData.name;
          }
          
          if (jsonData.telephone && !data.phone) {
            data.phone = jsonData.telephone;
          }
        } catch (e) {
          // JSON parsing failed, skip
        }
      });

    } catch (error) {
      logger.warn(`Error extracting GBP fields: ${error.message}`);
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