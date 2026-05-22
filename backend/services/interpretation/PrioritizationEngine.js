const priorityConstants = require('../../../shared/constants/priorities');
const logger = require('../../utils/logger');

class PrioritizationEngine {
  constructor(signals) {
    this.signals = signals;
  }

  /**
   * Generate prioritized findings from signals
   */
  generateFindings() {
    const findings = [];
    
    // Only create findings for problematic signals
    const problematicSignals = this.signals.filter(signal => 
      signal.status === 'missing' || 
      signal.status === 'inconsistent' || 
      signal.status === 'partial'
    );
    
    problematicSignals.forEach(signal => {
      const priority = priorityConstants.determinePriority(signal.severity, signal.category);
      
      findings.push({
        priority,
        category: signal.category,
        signal: signal.signalType,
        operationalImpact: signal.interpretation.operationalImpact,
        businessConsequence: signal.interpretation.businessConsequence,
        actionGuidance: signal.interpretation.actionGuidance,
        severity: signal.severity,
        status: signal.status
      });
    });
    
    // Sort findings by priority
    const sortedFindings = priorityConstants.sortFindings(findings);
    
    logger.debug(`Generated ${sortedFindings.length} prioritized findings`);
    
    return sortedFindings;
  }

  /**
   * Group findings by category
   */
  groupByCategory(findings) {
    const grouped = {
      website_health: [],
      mobile_experience: [],
      trust_presence: [],
      visibility_structure: []
    };
    
    findings.forEach(finding => {
      if (grouped[finding.category]) {
        grouped[finding.category].push(finding);
      }
    });
    
    return grouped;
  }

  /**
   * Group findings by priority
   */
  groupByPriority(findings) {
    const grouped = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: []
    };
    
    findings.forEach(finding => {
      if (grouped[finding.priority]) {
        grouped[finding.priority].push(finding);
      }
    });
    
    return grouped;
  }

  /**
   * Get top priority findings (limit to N)
   */
  getTopPriority(findings, limit = 10) {
    return findings.slice(0, limit);
  }

  /**
   * Calculate priority distribution
   */
  getPriorityDistribution(findings) {
    const distribution = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };
    
    findings.forEach(finding => {
      if (distribution[finding.priority] !== undefined) {
        distribution[finding.priority]++;
      }
    });
    
    return distribution;
  }
}

module.exports = PrioritizationEngine;