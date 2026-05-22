const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { validateAuditRequest } = require('../middleware/requestValidator');
const rateLimiter = require('../middleware/rateLimiter');

/**
 * POST /api/audit/execute
 * Execute new complete website audit
 */
router.post('/execute', 
  rateLimiter,
  validateAuditRequest,
  auditController.executeAudit
);

/**
 * GET /api/audit/:auditId
 * Get complete audit report by ID
 */
router.get('/:auditId', 
  auditController.getAuditReport
);

/**
 * GET /api/audit/:auditId/findings
 * Get findings grouped by category
 */
router.get('/:auditId/findings',
  auditController.getFindingsByCategory
);

/**
 * GET /api/audit/history
 * Get audit history for website
 */
router.get('/history', 
  auditController.getAuditHistory
);

module.exports = router;