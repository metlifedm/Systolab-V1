const mongoose = require('mongoose');

const auditSignalSchema = new mongoose.Schema({
  auditId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuditReport',
    required: true
  },
  
  // Signal Identity
  signalType: {
    type: String,
    required: true,
    enum: [
      'page_title',
      'meta_description',
      'heading_hierarchy',
      'image_alt_coverage',
      'internal_linking',
      'mobile_viewport',
      'https_status',
      'sitemap_presence',
      'robots_txt_presence',
      'schema_markup',
      'social_profiles',
      'contact_accessibility',
      'email_visibility',
      'phone_visibility',
      'address_visibility',
      'structural_consistency',
      'discoverability'
    ]
  },
  
  // Signal Status
  status: {
    type: String,
    enum: ['present', 'missing', 'partial', 'inconsistent', 'error'],
    required: true
  },
  
  // Extracted Data
  extractedValue: mongoose.Schema.Types.Mixed,
  
  // Page Context
  pageUrl: {
    type: String,
    required: true
  },
  
  pageType: {
    type: String,
    enum: ['homepage', 'internal', 'external'],
    default: 'internal'
  },
  
  // Operational Classification
  category: {
    type: String,
    enum: ['website_health', 'mobile_experience', 'trust_presence', 'visibility_structure'],
    required: true
  },
  
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    required: true
  },
  
  weight: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  
  // Human-Readable Interpretation
  interpretation: {
    operationalImpact: String,
    businessConsequence: String,
    actionGuidance: String
  },
  
  // Metadata
  extractionTimestamp: {
    type: Date,
    default: Date.now
  }
  
}, {
  timestamps: true,
  collection: 'audit_signals'
});

// Indexes
auditSignalSchema.index({ auditId: 1 });
auditSignalSchema.index({ signalType: 1, status: 1 });
auditSignalSchema.index({ category: 1, severity: 1 });

module.exports = mongoose.model('AuditSignal', auditSignalSchema);