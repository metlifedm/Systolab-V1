const cheerio = require('cheerio');
const { URL } = require('url');
const logger = require('../../utils/logger');
const { extractPhoneNumbers, isValidEmail } = require('../../utils/validators');

class SignalExtractor {
  constructor(pageResult) {
    this.pageResult = pageResult;
    this.$ = cheerio.load(pageResult.html);
    this.signals = {};
  }

  /**
   * Extract all operational signals from page
   */
  extractAll() {
    return {
      // Website Health Signals
      pageTitle: this.extractPageTitle(),
      metaDescription: this.extractMetaDescription(),
      headingHierarchy: this.extractHeadingHierarchy(),
      imageAltCoverage: this.extractImageAltCoverage(),
      internalLinking: this.extractInternalLinking(),
      
      // Mobile Experience Signals
      mobileViewport: this.extractMobileViewport(),
      
      // Trust Presence Signals
      httpsStatus: this.extractHTTPSStatus(),
      emailVisibility: this.extractEmailVisibility(),
      phoneVisibility: this.extractPhoneVisibility(),
      addressVisibility: this.extractAddressVisibility(),
      socialProfiles: this.extractSocialProfiles(),
      
      // Visibility Structure Signals
      schemaMarkup: this.extractSchemaMarkup(),
      canonicalTag: this.extractCanonicalTag(),
      
      // Additional metadata
      language: this.extractLanguage(),
      charset: this.extractCharset()
    };
  }

  /**
   * Extract page title
   */
  extractPageTitle() {
    const title = this.$('title').first().text().trim();
    
    return {
      present: title.length > 0,
      value: title,
      length: title.length,
      quality: this.assessTitleQuality(title)
    };
  }

  assessTitleQuality(title) {
    if (!title || title.length === 0) return 'missing';
    if (title.length < 10) return 'too_short';
    if (title.length > 70) return 'too_long';
    return 'good';
  }

  /**
   * Extract meta description
   */
  extractMetaDescription() {
    const description = this.$('meta[name="description"]').attr('content') || '';
    const trimmed = description.trim();
    
    return {
      present: trimmed.length > 0,
      value: trimmed,
      length: trimmed.length,
      quality: this.assessDescriptionQuality(trimmed)
    };
  }

  assessDescriptionQuality(description) {
    if (!description || description.length === 0) return 'missing';
    if (description.length < 50) return 'too_short';
    if (description.length > 160) return 'too_long';
    return 'good';
  }

  /**
   * Extract heading hierarchy
   */
  extractHeadingHierarchy() {
    const headings = {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: []
    };
    
    for (let i = 1; i <= 6; i++) {
      this.$(`h${i}`).each((index, element) => {
        const text = this.$(element).text().trim();
        if (text) {
          headings[`h${i}`].push(text);
        }
      });
    }
    
    const h1Count = headings.h1.length;
    const hasHeadings = Object.values(headings).some(arr => arr.length > 0);
    
    return {
      present: hasHeadings,
      h1Count,
      h1Text: headings.h1[0] || null,
      hierarchy: headings,
      quality: this.assessHeadingQuality(h1Count, hasHeadings)
    };
  }

  assessHeadingQuality(h1Count, hasHeadings) {
    if (!hasHeadings) return 'missing';
    if (h1Count === 0) return 'missing_h1';
    if (h1Count > 1) return 'multiple_h1';
    return 'good';
  }

  /**
   * Extract image alt attribute coverage
   */
  extractImageAltCoverage() {
    const images = this.$('img');
    const totalImages = images.length;
    let imagesWithAlt = 0;
    let imagesWithoutAlt = 0;
    
    images.each((index, element) => {
      const alt = this.$(element).attr('alt');
      if (alt !== undefined && alt.trim().length > 0) {
        imagesWithAlt++;
      } else {
        imagesWithoutAlt++;
      }
    });
    
    const coverage = totalImages > 0 ? (imagesWithAlt / totalImages) * 100 : 100;
    
    return {
      totalImages,
      imagesWithAlt,
      imagesWithoutAlt,
      coveragePercentage: Math.round(coverage),
      quality: coverage === 100 ? 'excellent' : coverage >= 80 ? 'good' : coverage >= 50 ? 'partial' : 'poor'
    };
  }

  /**
   * Extract internal linking structure
   */
  extractInternalLinking() {
    const links = this.$('a[href]');
    const internalLinks = [];
    const externalLinks = [];
    
    links.each((index, element) => {
      const href = this.$(element).attr('href');
      
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      
      try {
        const absoluteURL = new URL(href, this.pageResult.url);
        
        if (absoluteURL.hostname === new URL(this.pageResult.url).hostname) {
          internalLinks.push({
            url: absoluteURL.href,
            text: this.$(element).text().trim()
          });
        } else {
          externalLinks.push(absoluteURL.href);
        }
      } catch {
        // Invalid URL, skip
      }
    });
    
    return {
      totalLinks: links.length,
      internalLinks: internalLinks.length,
      externalLinks: externalLinks.length,
      quality: internalLinks.length > 0 ? 'present' : 'limited'
    };
  }

  /**
   * Extract mobile viewport configuration
   */
  extractMobileViewport() {
    const viewport = this.$('meta[name="viewport"]').attr('content') || '';
    const hasViewport = viewport.length > 0;
    
    return {
      present: hasViewport,
      value: viewport,
      hasWidthDevice: viewport.includes('width=device-width'),
      hasInitialScale: viewport.includes('initial-scale'),
      quality: hasViewport && viewport.includes('width=device-width') ? 'good' : 'missing'
    };
  }

  /**
   * Extract HTTPS status
   */
  extractHTTPSStatus() {
    const isHTTPS = this.pageResult.url.startsWith('https://');
    
    return {
      present: isHTTPS,
      protocol: isHTTPS ? 'https' : 'http',
      quality: isHTTPS ? 'secure' : 'insecure'
    };
  }

  /**
   * Extract email visibility
   */
  extractEmailVisibility() {
    const bodyText = this.$('body').text();
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = bodyText.match(emailPattern) || [];
    
    const uniqueEmails = [...new Set(emails)].filter(email => isValidEmail(email));
    
    return {
      present: uniqueEmails.length > 0,
      emails: uniqueEmails,
      count: uniqueEmails.length,
      quality: uniqueEmails.length > 0 ? 'visible' : 'missing'
    };
  }

  /**
   * Extract phone visibility
   */
  extractPhoneVisibility() {
    const bodyText = this.$('body').text();
    const phones = extractPhoneNumbers(bodyText);
    
    return {
      present: phones.length > 0,
      phones,
      count: phones.length,
      quality: phones.length > 0 ? 'visible' : 'missing'
    };
  }

  /**
   * Extract address visibility
   */
  extractAddressVisibility() {
    const bodyText = this.$('body').text();
    
    // Simple address pattern matching (can be enhanced)
    const addressPatterns = [
      /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|circle|cir|way)/gi,
      /\d+\s+[\w\s]+,\s*[\w\s]+,\s*[A-Z]{2}\s*\d{5}/gi
    ];
    
    let addressFound = false;
    let potentialAddresses = [];
    
    addressPatterns.forEach(pattern => {
      const matches = bodyText.match(pattern);
      if (matches) {
        addressFound = true;
        potentialAddresses = [...potentialAddresses, ...matches];
      }
    });
    
    return {
      present: addressFound,
      potentialAddresses: potentialAddresses.slice(0, 3), // Limit to first 3
      quality: addressFound ? 'visible' : 'missing'
    };
  }

  /**
   * Extract social profile links
   */
  extractSocialProfiles() {
    const socialDomains = [
      'facebook.com',
      'twitter.com',
      'instagram.com',
      'linkedin.com',
      'youtube.com',
      'pinterest.com',
      'tiktok.com'
    ];
    
    const socialLinks = [];
    
    this.$('a[href]').each((index, element) => {
      const href = this.$(element).attr('href');
      
      if (href) {
        socialDomains.forEach(domain => {
          if (href.includes(domain)) {
            socialLinks.push({
              platform: domain.replace('.com', ''),
              url: href
            });
          }
        });
      }
    });
    
    const uniqueSocial = Array.from(new Set(socialLinks.map(s => s.platform)))
      .map(platform => socialLinks.find(s => s.platform === platform));
    
    return {
      present: uniqueSocial.length > 0,
      profiles: uniqueSocial,
      count: uniqueSocial.length,
      quality: uniqueSocial.length > 0 ? 'visible' : 'missing'
    };
  }

  /**
   * Extract schema markup (JSON-LD)
   */
  extractSchemaMarkup() {
    const schemas = [];
    
    this.$('script[type="application/ld+json"]').each((index, element) => {
      try {
        const jsonText = this.$(element).html();
        const schemaData = JSON.parse(jsonText);
        schemas.push(schemaData);
      } catch (error) {
        logger.debug('Failed to parse schema markup');
      }
    });
    
    // Check for common schema types
    const hasOrganization = schemas.some(s => 
      s['@type'] === 'Organization' || (Array.isArray(s['@graph']) && s['@graph'].some(item => item['@type'] === 'Organization'))
    );
    
    const hasLocalBusiness = schemas.some(s => 
      s['@type'] === 'LocalBusiness' || (Array.isArray(s['@graph']) && s['@graph'].some(item => item['@type'] === 'LocalBusiness'))
    );
    
    return {
      present: schemas.length > 0,
      schemas,
      count: schemas.length,
      hasOrganization,
      hasLocalBusiness,
      quality: schemas.length > 0 ? 'present' : 'missing'
    };
  }

  /**
   * Extract canonical tag
   */
  extractCanonicalTag() {
    const canonical = this.$('link[rel="canonical"]').attr('href') || '';
    
    return {
      present: canonical.length > 0,
      url: canonical,
      quality: canonical.length > 0 ? 'present' : 'missing'
    };
  }

  /**
   * Extract page language
   */
  extractLanguage() {
    const htmlLang = this.$('html').attr('lang') || '';
    
    return {
      present: htmlLang.length > 0,
      value: htmlLang
    };
  }

  /**
   * Extract charset
   */
  extractCharset() {
    const charset = this.$('meta[charset]').attr('charset') || 
                   this.$('meta[http-equiv="Content-Type"]').attr('content') || '';
    
    return {
      present: charset.length > 0,
      value: charset
    };
  }
}

module.exports = SignalExtractor;