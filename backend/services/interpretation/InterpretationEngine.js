const ScoringEngine = require('./ScoringEngine');
const PrioritizationEngine = require('./PrioritizationEngine');
const logger = require('../../utils/logger');

class InterpretationEngine {
  constructor(signals, businessContext) {
    this.signals = signals;
    this.businessContext = businessContext;
    this.scoringEngine = new ScoringEngine(signals);
    this.prioritizationEngine = new PrioritizationEngine(signals);
  }

  /**
   * Generate complete operational interpretation
   */
  async interpret() {
    try {
      logger.info('Starting interpretation engine');
      
      // Calculate category scores
      const scores = this.scoringEngine.calculateAllScores();
      
      // Generate prioritized findings
      const findings = this.prioritizationEngine.generateFindings();
      
      // Generate operational summary
      const summary = this.generateSummary(scores, findings);
      
      // Enrich with business context insights
      const contextInsights = this.generateContextInsights();
      
      return {
        scores,
        findings,
        summary,
        contextInsights,
        interpretation: {
          overallHealth: this.assessOverallHealth(scores),
          criticalIssues: findings.filter(f => f.priority === 'critical').length,
          highPriorityIssues: findings.filter(f => f.priority === 'high').length,
          totalFindings: findings.length
        }
      };
      
    } catch (error) {
      logger.error(`Interpretation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate concise operational summary
   */
  generateSummary(scores, findings) {
    const criticalCount = findings.filter(f => f.priority === 'critical').length;
    const highCount = findings.filter(f => f.priority === 'high').length;
    
    const overallLevel = scores.overall.level;
    
    // Generate non-repetitive, calm operational summary
    if (overallLevel === 'critical') {
      if (criticalCount > 0) {
        return `Website analysis identified ${criticalCount} critical operational issue${criticalCount > 1 ? 's' : ''} that may significantly impact visitor experience and business accessibility. Immediate attention recommended for trust and mobile accessibility concerns.`;
      }
      return `Website operational structure needs immediate improvement across multiple areas including visitor accessibility, trust signals, and mobile experience.`;
    }
    
    if (overallLevel === 'needs_improvement') {
      return `Website shows ${highCount + criticalCount} operational limitation${(highCount + criticalCount) > 1 ? 's' : ''} that may affect visitor clarity and discoverability. Focus on strengthening contact accessibility and structural consistency.`;
    }
    
    if (overallLevel === 'good') {
      const remainingIssues = findings.filter(f => f.priority === 'medium' || f.priority === 'low').length;
      return `Website demonstrates solid operational foundation with ${remainingIssues} improvement opportunit${remainingIssues !== 1 ? 'ies' : 'y'} to enhance visitor experience and structural clarity.`;
    }
    
    return `Website maintains excellent operational health across all analyzed dimensions. Continue monitoring for consistency as content evolves.`;
  }

  /**
   * Generate business context insights
   */
  generateContextInsights() {
    if (!this.businessContext || !this.businessContext.hasContext) {
      return null;
    }

    const insights = [];

    if (this.businessContext.mode === 'with_gbp_context') {
      const ctx = this.businessContext.context;
      
      if (ctx.hasRating && ctx.hasReviews) {
        insights.push({
          type: 'positive',
          message: `Google Business Profile shows ${ctx.ratingValue} star rating with ${ctx.reviewCount} reviews, indicating established customer presence.`
        });
      }
      
      if (ctx.businessName) {
        insights.push({
          type: 'info',
          message: `Business identified as "${ctx.businessName}" through Google Business Profile.`
        });
      }
    }

    if (this.businessContext.mode === 'website_derived_context') {
      const ctx = this.businessContext.context;
      
      if (ctx.businessName) {
        insights.push({
          type: 'info',
          message: `Business name "${ctx.businessName}" identified from website structured data.`
        });
      }
      
      if (ctx.organizationSchema) {
        insights.push({
          type: 'positive',
          message: `Website includes organization schema markup, helping systems understand business identity.`
        });
      }
    }

    return insights.length > 0 ? insights : null;
  }

  /**
   * Assess overall operational health
   */
  assessOverallHealth(scores) {
    const level = scores.overall.level;
    
    const assessments = {
      excellent: {
        status: 'Excellent',
        description: 'Website demonstrates strong operational health across all analyzed dimensions.'
      },
      good: {
        status: 'Good',
        description: 'Website shows solid operational foundation with minor improvement opportunities.'
      },
      needs_improvement: {
        status: 'Needs Improvement',
        description: 'Website has operational limitations that should be addressed to improve visitor experience.'
      },
      critical: {
        status: 'Critical',
        description: 'Website requires immediate attention to address significant operational issues.'
      }
    };

    return assessments[level] || assessments.needs_improvement;
  }
}

module.exports = InterpretationEngine;