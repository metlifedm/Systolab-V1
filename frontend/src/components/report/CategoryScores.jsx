import React from 'react';

const CategoryScores = ({ scores }) => {
  const { overall, categories } = scores;

  const getScoreColor = (level) => {
    const colors = {
      'excellent': '#10b981',
      'good': '#3b82f6',
      'needs_improvement': '#f59e0b',
      'critical': '#ef4444'
    };
    return colors[level] || '#6b7280';
  };

  const ScoreCard = ({ title, score, level, label }) => {
    const scoreColor = getScoreColor(level);
    const percentage = score;

    return (
      <div className="score-card">
        <div className="score-header">
          <h3 className="score-title">{title}</h3>
          <span className={`score-badge badge-${level}`}>{label}</span>
        </div>
        <div className="score-body">
          <div className="score-circle">
            <svg viewBox="0 0 120 120" className="score-svg">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={scoreColor}
                strokeWidth="10"
                strokeDasharray={`${(percentage / 100) * 314} 314`}
                strokeDashoffset="0"
                transform="rotate(-90 60 60)"
                strokeLinecap="round"
              />
              <text
                x="60"
                y="65"
                textAnchor="middle"
                fontSize="24"
                fontWeight="bold"
                fill={scoreColor}
              >
                {score}
              </text>
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="category-scores">
      <h2 className="section-title">Operational Performance Scores</h2>

      <div className="overall-score">
        <ScoreCard
          title="Overall Operational Health"
          score={overall.score}
          level={overall.level}
          label={overall.label}
        />
      </div>

      <div className="category-scores-grid">
        <ScoreCard
          title="Website Health"
          score={categories.websiteHealth.score}
          level={categories.websiteHealth.level}
          label={categories.websiteHealth.label}
        />
        <ScoreCard
          title="Mobile Experience"
          score={categories.mobileExperience.score}
          level={categories.mobileExperience.level}
          label={categories.mobileExperience.label}
        />
        <ScoreCard
          title="Trust Presence"
          score={categories.trustPresence.score}
          level={categories.trustPresence.level}
          label={categories.trustPresence.label}
        />
        <ScoreCard
          title="Visibility Structure"
          score={categories.visibilityStructure.score}
          level={categories.visibilityStructure.level}
          label={categories.visibilityStructure.label}
        />
      </div>
    </div>
  );
};

export default CategoryScores;