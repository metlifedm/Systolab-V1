const scoringConstants = require('../../../shared/constants/scoring');
const logger = require('../../utils/logger');

class ScoringEngine {
  constructor(signals) {
    this.signals = signals;
  }

  /**
   * Calculate scores for all categories
   */
  calculateAllScores() {
    const categories = ['website_health', 'mobile_experience', 'trust_presence', 'visibility_structure'];
    
    const scores = {};
    
    categories.forEach(category => {
      const categoryScore = this.calculateCategoryScore(category);
      scores[this.formatCategoryKey(category)] = {
        score: categoryScore,
        level: scoringConstants.getScoreLevel(categoryScore)
      };
    });
    
    // Calculate overall score (weighted average)
    const overallScore = this.calculateOverallScore(scores);
    scores.overall = {
      score: overallScore,
      level: scoringConstants.getScoreLevel(overallScore)
    };
    
    logger.debug('Scores calculated:', scores);
    
    return scores;
  }

  /**
   * Calculate score for specific category
   */
  calculateCategoryScore(category) {
    return scoringConstants.calculateCategoryScore(this.signals, category);
  }

  /**
   * Calculate weighted overall score
   */
  calculateOverallScore(categoryScores) {
    const weights = scoringConstants.CATEGORY_WEIGHTS;
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    Object.keys(weights).forEach(category => {
      const formattedKey = this.formatCategoryKey(category);
      if (categoryScores[formattedKey]) {
        weightedSum += categoryScores[formattedKey].score * weights[category];
        totalWeight += weights[category];
      }
    });
    
    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  /**
   * Format category key for consistency
   */
  formatCategoryKey(category) {
    return category.replace(/_/g, '');
  }

  /**
   * Get score interpretation
   */
  getScoreInterpretation(score) {
    const level = scoringConstants.getScoreLevel(score);
    
    const interpretations = {
      excellent: 'Strong operational performance',
      good: 'Solid foundation with minor improvements possible',
      needs_improvement: 'Operational limitations present',
      critical: 'Immediate attention required'
    };
    
    return interpretations[level] || 'Score assessed';
  }
}

module.exports = ScoringEngine;