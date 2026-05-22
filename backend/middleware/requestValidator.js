const { validateWebsiteURL, validateGBPLink } = require('../utils/validators');

module.exports = {
  validateAuditRequest(req, res, next) {
    const { websiteUrl, gbpLink } = req.body;
    
    // Validate website URL (required)
    const urlValidation = validateWebsiteURL(websiteUrl);
    if (!urlValidation.valid) {
      return res.status(400).json({
        state: 'error',
        error: {
          message: urlValidation.error,
          field: 'websiteUrl'
        }
      });
    }
    
    // Validate GBP link (optional)
    if (gbpLink) {
      const gbpValidation = validateGBPLink(gbpLink);
      if (!gbpValidation.valid) {
        return res.status(400).json({
          state: 'error',
          error: {
            message: gbpValidation.error,
            field: 'gbpLink'
          }
        });
      }
      req.validatedGBP = gbpValidation.normalized;
    }
    
    // Attach validated URL to request
    req.validatedURL = urlValidation.normalized;
    req.validatedDomain = urlValidation.domain;
    
    next();
  }
};