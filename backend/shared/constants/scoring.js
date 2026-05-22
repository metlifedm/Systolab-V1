// Deterministic Scoring Framework

module.exports = {
  // Category Weight Distribution (must sum to 100)
  CATEGORY_WEIGHTS: {
    website_health: 30,
    mobile_experience: 25,
    trust_presence: 25,
    visibility_structure: 20
  },
  
  // Score Level Thresholds
  SCORE_LEVELS: {
    excellent: { min: 90, max: 100, label: 'Excellent' },
    good: { min: 70, max: 89, label: 'Good' },
    needs_improvement: { min: 50, max: 69, label: 'Needs Improvement' },
    critical: { min: 0, max: 49, label: 'Critical' }
  },
  
  // Severity Impact Multipliers
  SEVERITY_MULTIPLIERS: {
    critical: 1.0,  // Full weight impact
    high: 0.8,
    medium: 0.5,
    low: 0.3,
    info: 0.1
  },
  
  // Base score starts at 100, signals deduct based on severity and weight
  BASE_SCORE: 100,
  
  // Scoring calculation method: BASE_SCORE - (signal.weight * severity_multiplier)
  calculateCategoryScore(signals, category) {
    let score = this.BASE_SCORE;
    
    const categorySignals = signals.filter(s => s.category === category);
    
    categorySignals.forEach(signal => {
      if (signal.status === 'missing' || signal.status === 'inconsistent') {
        const deduction = signal.weight * (this.SEVERITY_MULTIPLIERS[signal.severity] || 0);
        score -= deduction;
      } else if (signal.status === 'partial') {
        const deduction = (signal.weight * 0.5) * (this.SEVERITY_MULTIPLIERS[signal.severity] || 0);
        score -= deduction;
      }
    });
    
    return Math.max(0, Math.min(100, Math.round(score)));
  },
  
  getScoreLevel(score) {
    if (score >= this.SCORE_LEVELS.excellent.min) return 'excellent';
    if (score >= this.SCORE_LEVELS.good.min) return 'good';
    if (score >= this.SCORE_LEVELS.needs_improvement.min) return 'needs_improvement';
    return 'critical';
  }
};