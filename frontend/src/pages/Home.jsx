import React from 'react';
import { useNavigate } from 'react-router-dom';
import URLInput from '../components/input/URLInput';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuditExecution } from '../hooks/useAudit';

const Home = () => {
  const navigate = useNavigate();
  const { executeAudit, loading, error } = useAuditExecution();

  const handleAuditSubmit = async (websiteUrl, gbpLink) => {
    try {
      const result = await executeAudit(websiteUrl, gbpLink);
      
      if (result && result.auditId) {
        navigate(`/report/${result.auditId}`);
      }
    } catch (err) {
      console.error('Audit execution failed:', err);
    }
  };

  return (
    <div className="home-page">
      <div className="container">
        <div className="home-content">
          <div className="hero-section">
            <h2 className="hero-title">
              Operational Diagnostic Platform
            </h2>
            <p className="hero-description">
              Enter a website URL to receive a structured, human-readable operational report 
              about your digital business presence. SYSTOLAB translates publicly accessible 
              website signals into clear operational understanding.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner message="Analyzing website operational signals..." />
          ) : (
            <URLInput onSubmit={handleAuditSubmit} loading={loading} />
          )}

          {error && (
            <div className="error-message">
              <p className="error-title">Analysis Error</p>
              <p className="error-text">{error}</p>
            </div>
          )}

          <div className="features-section">
            <h3 className="features-title">What SYSTOLAB Analyzes</h3>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🏥</div>
                <h4>Website Health</h4>
                <p>Page structure, metadata quality, heading hierarchy, and content organization</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h4>Mobile Experience</h4>
                <p>Mobile viewport configuration and responsive design indicators</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h4>Trust Presence</h4>
                <p>Security status, contact accessibility, and business identity visibility</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h4>Visibility Structure</h4>
                <p>Sitemap presence, schema markup, and discoverability indicators</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;