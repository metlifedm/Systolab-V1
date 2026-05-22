const logger = require('../../utils/logger');

class WebsiteContextExtractor {
  constructor(crawlResult) {
    this.crawlResult = crawlResult;
  }

  /**
   * Extract business context from website signals
   */
  async extract() {
    try {
      const context = {
        businessName: null,
        category: null,
        organizationSchema: null,
        structuredContact: {
          email: [],
          phone: [],
          address: []
        },
        socialProfiles: []
      };

      // Check if crawlResult has pages array
      if (!this.crawlResult || !this.crawlResult.pages || !Array.isArray(this.crawlResult.pages)) {
        logger.warn('No crawl pages available for context extraction');
        return { hasContext: false, data: null };
      }

      // Extract from all crawled pages
      for (const page of this.crawlResult.pages) {
        if (!page || !page.html) {
          continue;
        }

        // Extract from schema markup
        const schemaData = this.extractFromSchema(page.html);
        if (schemaData.businessName && !context.businessName) {
          context.businessName = schemaData.businessName;
          context.organizationSchema = schemaData;
        }

        // Extract structured contact
        const contactData = this.extractContactInfo(page.html);
        context.structuredContact.email.push(...contactData.emails);
        context.structuredContact.phone.push(...contactData.phones);
        context.structuredContact.address.push(...contactData.addresses);
      }

      // Deduplicate contact information
      context.structuredContact.email = [...new Set(context.structuredContact.email)];
      context.structuredContact.phone = [...new Set(context.structuredContact.phone)];
      context.structuredContact.address = [...new Set(context.structuredContact.address)];

      // Determine if we have meaningful context
      const hasContext = 
        context.businessName !== null || 
        context.structuredContact.email.length > 0 ||
        context.structuredContact.phone.length > 0;

      if (hasContext) {
        logger.info(`Website context extracted: Business name - ${context.businessName || 'N/A'}`);
      }

      return {
        hasContext,
        data: hasContext ? context : null
      };
      
    } catch (error) {
      logger.error(`Website context extraction failed: ${error.message}`);
      return { hasContext: false, data: null };
    }
  }

  /**
   * Extract business info from schema markup
   */
  extractFromSchema(html) {
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    
    const schemaData = {
      businessName: null,
      type: null,
      address: null,
      phone: null,
      email: null
    };

    $('script[type="application/ld+json"]').each((index, element) => {
      try {
        const jsonText = $(element).html();
        const schema = JSON.parse(jsonText);
        
        // Handle @graph structure
        const items = schema['@graph'] || [schema];
        
        items.forEach(item => {
          const type = item['@type'];
          
          if (type === 'Organization' || type === 'LocalBusiness' || 
              (Array.isArray(type) && (type.includes('Organization') || type.includes('LocalBusiness')))) {
            
            if (item.name && !schemaData.businessName) {
              schemaData.businessName = item.name;
            }
            
            if (item['@type']) {
              schemaData.type = Array.isArray(item['@type']) 
                ? item['@type'].join(', ') 
                : item['@type'];
            }
            
            if (item.address && !schemaData.address) {
              schemaData.address = typeof item.address === 'string'
                ? item.address
                : `${item.address.streetAddress || ''}, ${item.address.addressLocality || ''}, ${item.address.addressRegion || ''}`.trim();
            }
            
            if (item.telephone && !schemaData.phone) {
              schemaData.phone = item.telephone;
            }
            
            if (item.email && !schemaData.email) {
              schemaData.email = item.email;
            }
          }
        });
        
      } catch (error) {
        // Invalid JSON, skip
      }
    });

    return schemaData;
  }

  /**
   * Extract contact information from page
   */
  extractContactInfo(html) {
    const cheerio = require('cheerio');
    const { extractPhoneNumbers, isValidEmail } = require('../../utils/validators');
    const $ = cheerio.load(html);
    
    const bodyText = $('body').text();
    
    // Extract emails
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = (bodyText.match(emailPattern) || [])
      .filter(email => isValidEmail(email))
      .slice(0, 5); // Limit to 5

    // Extract phones
    const phones = extractPhoneNumbers(bodyText).slice(0, 5);

    // Extract addresses (basic pattern)
    const addressPatterns = [
      /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr)\s*,?\s*[\w\s]+,\s*[A-Z]{2}\s*\d{5}/gi
    ];
    
    let addresses = [];
    addressPatterns.forEach(pattern => {
      const matches = bodyText.match(pattern);
      if (matches) {
        addresses.push(...matches);
      }
    });
    addresses = [...new Set(addresses)].slice(0, 3);

    return { emails, phones, addresses };
  }
}

module.exports = WebsiteContextExtractor;