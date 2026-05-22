import React from 'react';

const ReportSummary = ({ report }) => {
  const { summary, websiteUrl, executionTimestamp, auditMode, metadata } = report;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAuditModeLabel = (mode) => {
    const labels = {
      'website_only': 'Website-Only Analysis',
      'with_gbp_context': 'Enhanced with Google Business Profile',
      'website_derived_context': 'Business Context from Website'
    };
    return labels[mode] || 'Standard Analysis';
  };

  return (
    <div className="report-summary">
      <div className="summary-header">
        <h2>Operational Analysis Summary</h2>
        <div className="summary-meta">
          <span className="meta-item">
            <strong>Website:</strong> {websiteUrl}
          </span>
          <span className="meta-item">
            <strong>Analyzed:</strong> {formatDate(executionTimestamp)}
          </span>
          <span className="meta-item">
            <strong>Mode:</strong> {getAuditModeLabel(auditMode)}
          </span>
        </div>
      </div>

      <div className="summary-content">
        <p className="summary-text">{summary}</p>
      </div>

      <div className="summary-stats">
        <div className="stat-item">
          <span className="stat-value">{metadata.pagesAnalyzed}</span>
          <span className="stat-label">Pages Analyzed</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{metadata.signalsExtracted}</span>
          <span className="stat-label">Signals Extracted</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{metadata.findingsCount}</span>
          <span className="stat-label">Total Findings</span>
        </div>
        <div className="stat-item critical">
          <span className="stat-value">{metadata.criticalIssues}</span>
          <span className="stat-label">Critical Issues</span>
        </div>
      </div>
    </div>
  );
};

export default ReportSummary;