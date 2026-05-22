const mongoose = require('mongoose');

const auditReportSchema = new mongoose.Schema({
  // Input Information
  websiteUrl: {
    type: String,
    required: true,
    trim: true
  },
  
  gbpLink: {
    type: String,
    trim: true,
    default: null
  },
  
  // Execution Metadata
  auditMode: {
    type: String,
    enum: ['website_only', 'with_gbp_context', 'website_derived_context'],
    required: true
  },
  
  executionState: {
    type: String,
    enum: ['success', 'partial', 'error'],
    required: true
  },
  
  executionTimestamp: {
    type: Date,
    default: Date.now
  },
  
  executionDuration: {
    type: Number, // milliseconds
    required: true
  },
  
  // Crawl Statistics
  crawlStats: {
    pagesAnalyzed: { type: Number, default: 0 },
    pagesSkipped: { type: Number, default: 0 },
    pagesFailed: { type: Number, default: 0 },
    totalRequests: { type: Number, default: 0 },
    crawlDepth: { type: Number, default: 1 }
  },
  
  // Extracted Signals
  signals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuditSignal'
  }],
  
  // Business Context
  businessContext: {
    hasGBPData: { type: Boolean, default: false },
    businessName: String,
    businessCategory: String,
    hasRating: Boolean,
    hasReviews: Boolean,
    contactConsistency: Boolean,
    derivedFromWebsite: { type: Boolean, default: false },
    organizationSchema: Object,
    structuredContact: Object
  },
  
  // Category Scores
  scores: {
    websiteHealth: {
      score: { type: Number, min: 0, max: 100 },
      level: { type: String, enum: ['excellent', 'good', 'needs_improvement', 'critical'] }
    },
    mobileExperience: {
      score: { type: Number, min: 0, max: 100 },
      level: { type: String, enum: ['excellent', 'good', 'needs_improvement', 'critical'] }
    },
    trustPresence: {
      score: { type: Number, min: 0, max: 100 },
      level: { type: String, enum: ['excellent', 'good', 'needs_improvement', 'critical'] }
    },
    visibilityStructure: {
      score: { type: Number, min: 0, max: 100 },
      level: { type: String, enum: ['excellent', 'good', 'needs_improvement', 'critical'] }
    },
    overall: {
      score: { type: Number, min: 0, max: 100 },
      level: { type: String, enum: ['excellent', 'good', 'needs_improvement', 'critical'] }
    }
  },
  
  // Prioritized Findings
  findings: [{
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'info']
    },
    category: {
      type: String,
      enum: ['website_health', 'mobile_experience', 'trust_presence', 'visibility_structure']
    },
    signal: String,
    operationalImpact: String,
    businessConsequence: String,
    actionGuidance: String
  }],
  
  // Operational Summary
  summary: {
    type: String,
    maxlength: 500
  },
  
  // Technical Notes
  technicalNotes: [{
    type: {
      type: String,
      enum: ['warning', 'limitation', 'info', 'error']
    },
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Error Tracking
  errors: [{
    stage: String,
    error: String,
    timestamp: { type: Date, default: Date.now }
  }]
  
}, {
  timestamps: true,
  collection: 'audit_reports'
});

// Indexes for query performance
auditReportSchema.index({ websiteUrl: 1, executionTimestamp: -1 });
auditReportSchema.index({ executionTimestamp: -1 });
auditReportSchema.index({ 'scores.overall.level': 1 });

module.exports = mongoose.model('AuditReport', auditReportSchema);