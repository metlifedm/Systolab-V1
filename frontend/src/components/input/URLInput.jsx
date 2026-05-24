import React, { useState } from 'react';

const URLInput = ({ onSubmit, loading }) => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [gbpLink, setGbpLink] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!websiteUrl.trim()) {
      setError('Website URL is required');
      return;
    }

    // Clean URL
    let cleanUrl = websiteUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    onSubmit(cleanUrl, gbpLink.trim() || null);
  };

  return (
    <div className="url-input-container">
      <form onSubmit={handleSubmit} className="url-input-form">
        <div className="form-group">
          <label htmlFor="websiteUrl" className="form-label">
            Website URL
          </label>
          <input
            type="text"
            id="websiteUrl"
            className="form-input"
            placeholder="example.com or https://example.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </div>

        <div className="form-advanced">
          <button
            type="button"
            className="btn-link"
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={loading}
          >
            {showAdvanced ? '▼' : '▶'} Advanced Options
          </button>
        </div>

        {showAdvanced && (
          <div className="form-group">
            <label htmlFor="gbpLink" className="form-label">
              Google Business Profile Link (Optional)
            </label>
            <input
              type="text"
              id="gbpLink"
              className="form-input"
              placeholder="https://maps.google.com/..."
              value={gbpLink}
              onChange={(e) => setGbpLink(e.target.value)}
              disabled={loading}
            />
            <p className="form-help">
              Provide a public Google Business Profile link to enrich business context interpretation.
            </p>
          </div>
        )}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Start Operational Diagnosis'}
        </button>
      </form>

      {/* <div className="transparency-notice">
        <p className="notice-title">⚠️ Technical Analysis Scope</p>
        <p className="notice-text">
          SYSTOLAB analyzes publicly accessible static HTML structure. Some modern websites 
          load content dynamically using JavaScript, which may affect signal detection and 
          interpretation accuracy.
        </p>
      </div> */}
    </div>
  );
};

export default URLInput;