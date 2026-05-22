const rateLimit = require('express-rate-limit');
const config = require('../config/environment');

module.exports = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_REQUESTS,
  message: {
    state: 'error',
    error: {
      message: 'Too many audit requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});