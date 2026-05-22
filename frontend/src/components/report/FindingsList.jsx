import React, { useState } from 'react';

const FindingsList = ({ findings }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePriority, setActivePriority] = useState('all');

  const getPriorityIcon = (priority) => {
    const icons = {
      'critical': '🔴',
      'high': '🟠',
      'medium': '🟡',
      'low': '🔵',
      'info': 'ℹ️'
    };
    return icons[priority] || '•';
  };

  const filterFindings = () => {
    let filtered = findings;

    if (activeCategory !== 'all') {
      filtered = filtered.filter(f => f.category === activeCategory);
    }

    if (activePriority !== 'all') {
      filtered = filtered.filter(f => f.priority === activePriority);
    }

    return filtered;
  };

  const filteredFindings = filterFindings();

  const FindingCard = ({ finding }) => {
    return (
      <div className={`finding-card priority-${finding.priority}`}>
        <div className="finding-header">
          <span className="finding-icon">{getPriorityIcon(finding.priority)}</span>
          <div className="finding-title-group">
            <h4 className="finding-title">{finding.categoryLabel}</h4>
            <span className={`priority-badge badge-${finding.priority}`}>
              {finding.priorityLabel}
            </span>
          </div>
        </div>
        <div className="finding-content">
          <div className="finding-section">
            <strong>Operational Impact:</strong>
            <p>{finding.impact}</p>
          </div>
          <div className="finding-section">
            <strong>Business Consequence:</strong>
            <p>{finding.consequence}</p>
          </div>
          <div className="finding-section action">
            <strong>Recommended Action:</strong>
            <p>{finding.action}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="findings-list">
      <h2 className="section-title">Prioritized Operational Findings</h2>

      <div className="findings-filters">
        <div className="filter-group">
          <label className="filter-label">Filter by Category:</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${activeCategory === 'website_health' ? 'active' : ''}`}
              onClick={() => setActiveCategory('website_health')}
            >
              Website Health
            </button>
            <button
              className={`filter-btn ${activeCategory === 'mobile_experience' ? 'active' : ''}`}
              onClick={() => setActiveCategory('mobile_experience')}
            >
              Mobile Experience
            </button>
            <button
              className={`filter-btn ${activeCategory === 'trust_presence' ? 'active' : ''}`}
              onClick={() => setActiveCategory('trust_presence')}
            >
              Trust Presence
            </button>
            <button
              className={`filter-btn ${activeCategory === 'visibility_structure' ? 'active' : ''}`}
              onClick={() => setActiveCategory('visibility_structure')}
            >
              Visibility Structure
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Filter by Priority:</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${activePriority === 'all' ? 'active' : ''}`}
              onClick={() => setActivePriority('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${activePriority === 'critical' ? 'active' : ''}`}
              onClick={() => setActivePriority('critical')}
            >
              Critical
            </button>
            <button
              className={`filter-btn ${activePriority === 'high' ? 'active' : ''}`}
              onClick={() => setActivePriority('high')}
            >
              High
            </button>
            <button
              className={`filter-btn ${activePriority === 'medium' ? 'active' : ''}`}
              onClick={() => setActivePriority('medium')}
            >
              Medium
            </button>
            <button
              className={`filter-btn ${activePriority === 'low' ? 'active' : ''}`}
              onClick={() => setActivePriority('low')}
            >
              Low
            </button>
          </div>
        </div>
      </div>

      <div className="findings-count">
        Showing {filteredFindings.length} of {findings.length} findings
      </div>

      <div className="findings-grid">
        {filteredFindings.length > 0 ? (
          filteredFindings.map((finding, index) => (
            <FindingCard key={index} finding={finding} />
          ))
        ) : (
          <div className="no-findings">
            <p>No findings match the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindingsList;