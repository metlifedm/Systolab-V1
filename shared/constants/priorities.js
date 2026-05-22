// Deterministic Prioritization Framework

module.exports = {
  // Priority ranking logic based on severity + category weight
  PRIORITY_MATRIX: {
    critical: {
      website_health: 'critical',
      mobile_experience: 'critical',
      trust_presence: 'critical',
      visibility_structure: 'high'
    },
    high: {
      website_health: 'high',
      mobile_experience: 'high',
      trust_presence: 'high',
      visibility_structure: 'medium'
    },
    medium: {
      website_health: 'medium',
      mobile_experience: 'medium',
      trust_presence: 'medium',
      visibility_structure: 'low'
    },
    low: {
      website_health: 'low',
      mobile_experience: 'low',
      trust_presence: 'low',
      visibility_structure: 'low'
    },
    info: {
      website_health: 'info',
      mobile_experience: 'info',
      trust_presence: 'info',
      visibility_structure: 'info'
    }
  },
  
  // Priority order for sorting findings
  PRIORITY_ORDER: ['critical', 'high', 'medium', 'low', 'info'],
  
  determinePriority(severity, category) {
    return this.PRIORITY_MATRIX[severity]?.[category] || 'low';
  },
  
  sortFindings(findings) {
    return findings.sort((a, b) => {
      const priorityA = this.PRIORITY_ORDER.indexOf(a.priority);
      const priorityB = this.PRIORITY_ORDER.indexOf(b.priority);
      return priorityA - priorityB;
    });
  }
};