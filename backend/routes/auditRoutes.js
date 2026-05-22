const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { validateAuditRequest } = require('../middleware/requestValidator');
const rateLimiter = require('../middleware/rateLimiter');

/**
 * POST /api/audit/execute
 * Execute new website audit
 */
router.post('/execute', 
  rateLimiter,
  validateAuditRequest,
  auditController.executeAudit
);

/**
 * GET /api/audit/:auditId
 * Get audit report by ID
 */
router.get('/:auditId', 
  auditController.getAuditReport
);

/**
 * GET /api/audit/history
 * Get audit history for website
 */
router.get('/history', 
  auditController.getAuditHistory
);

module.exports = router;