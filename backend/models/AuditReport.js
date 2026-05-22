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
    enum: ['pending', 'website_only', 'with_gbp_context', 'website_derived_context'],
    default: 'pending'
  },
  
  executionState: {
    type: String,
    enum: ['processing', 'success', 'partial', 'error'],
    default: 'processing'
  },
  
  executionTimestamp: {
    type: Date,
    default: Date.now
  },
  
  executionDuration: {
    type: Number,
    default: 0
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

  // GBP FLAGS
  hasGBPData: {
    type: Boolean,
    default: false
  },

  derivedFromWebsite: {
    type: Boolean,
    default: false
  },

  // BUSINESS INFO
  businessName: {
    type: String,
    default: null
  },

  businessCategory: {
    type: String,
    default: null
  },

  // RATINGS
  hasRating: {
    type: Boolean,
    default: false
  },

  ratingValue: {
    type: Number,
    default: null
  },

  hasReviews: {
    type: Boolean,
    default: false
  },

  reviewCount: {
    type: Number,
    default: null
  },

  // CONTACT INFO
  address: {
    type: String,
    default: null
  },

  phone: {
    type: String,
    default: null
  },

  website: {
    type: String,
    default: null
  },

  // PROFILE QUALITY
  profileCompleteness: {
    type: Number,
    default: null
  },

  contactConsistency: {
    type: Boolean,
    default: null
  },

  // WEBSITE DERIVED
  organizationSchema: {
    type: Object,
    default: null
  },

  structuredContact: {
    type: Object,
    default: null
  }
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
  
  // Error Tracking - Renamed from 'errors' to 'executionErrors' to avoid reserved keyword
  executionErrors: [{
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