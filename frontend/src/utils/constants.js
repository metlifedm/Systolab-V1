/**
 * Application constants
 */

export const AUDIT_MODES = {
  WEBSITE_ONLY: 'website_only',
  WITH_GBP: 'with_gbp_context',
  WEBSITE_DERIVED: 'website_derived_context'
};

export const SCORE_LEVELS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  NEEDS_IMPROVEMENT: 'needs_improvement',
  CRITICAL: 'critical'
};

export const PRIORITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info'
};

export const CATEGORIES = {
  WEBSITE_HEALTH: 'website_health',
  MOBILE_EXPERIENCE: 'mobile_experience',
  TRUST_PRESENCE: 'trust_presence',
  VISIBILITY_STRUCTURE: 'visibility_structure'
};

export const CATEGORY_LABELS = {
  [CATEGORIES.WEBSITE_HEALTH]: 'Website Health',
  [CATEGORIES.MOBILE_EXPERIENCE]: 'Mobile Experience',
  [CATEGORIES.TRUST_PRESENCE]: 'Trust Presence',
  [CATEGORIES.VISIBILITY_STRUCTURE]: 'Visibility Structure'
};

export const PRIORITY_LABELS = {
  [PRIORITY_LEVELS.CRITICAL]: 'Critical',
  [PRIORITY_LEVELS.HIGH]: 'High Priority',
  [PRIORITY_LEVELS.MEDIUM]: 'Medium Priority',
  [PRIORITY_LEVELS.LOW]: 'Low Priority',
  [PRIORITY_LEVELS.INFO]: 'Informational'
};

export const SCORE_LABELS = {
  [SCORE_LEVELS.EXCELLENT]: 'Excellent',
  [SCORE_LEVELS.GOOD]: 'Good',
  [SCORE_LEVELS.NEEDS_IMPROVEMENT]: 'Needs Improvement',
  [SCORE_LEVELS.CRITICAL]: 'Critical'
};

export const API_STATES = {
  SUCCESS: 'success',
  ERROR: 'error',
  PARTIAL: 'partial'
};

export const LOADING_MESSAGES = {
  EXECUTING_AUDIT: 'Analyzing website operational signals...',
  LOADING_REPORT: 'Loading audit report...',
  PROCESSING: 'Processing...'
};