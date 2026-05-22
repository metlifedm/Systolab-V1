const mongoose = require('mongoose');

const auditHistorySchema = new mongoose.Schema({
  websiteUrl: {
    type: String,
    required: true,
    trim: true
  },
  
  auditCount: {
    type: Number,
    default: 0
  },
  
  lastAuditDate: {
    type: Date
  },
  
  audits: [{
    auditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuditReport'
    },
    executionDate: Date,
    overallScore: Number,
    executionState: String
  }],
  
  // Trend tracking (future enhancement)
  trends: {
    websiteHealth: [Number],
    mobileExperience: [Number],
    trustPresence: [Number],
    visibilityStructure: [Number]
  }
  
}, {
  timestamps: true,
  collection: 'audit_history'
});

auditHistorySchema.index({ websiteUrl: 1 });

module.exports = mongoose.model('AuditHistory', auditHistorySchema);