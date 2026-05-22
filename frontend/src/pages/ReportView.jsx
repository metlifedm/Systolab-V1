import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auditAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ReportSummary from '../components/report/ReportSummary';
import CategoryScores from '../components/report/CategoryScores';
import FindingsList from '../components/report/FindingsList';
import TransparencyNotice from '../components/report/TransparencyNotice';

const ReportView = () => {
  const { auditId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await auditAPI.getAuditReport(auditId);
        
        if (response.state === 'success') {
          setReport(response.data);
        } else {
          setError(response.error?.message || 'Failed to load report');
        }
      } catch (err) {
        setError(err.error?.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    if (auditId) {
      fetchReport();
    }
  }, [auditId]);

  const handleNewAudit = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="report-page">
        <div className="container">
          <LoadingSpinner message="Loading audit report..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-page">
        <div className="container">
          <div className="error-message">
            <p className="error-title">Report Not Found</p>
            <p className="error-text">{error}</p>
            <button className="btn-primary" onClick={handleNewAudit}>
              Start New Audit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="report-page">
      <div className="container">
        <div className="report-actions">
          <button className="btn-secondary" onClick={handleNewAudit}>
            ← New Audit
          </button>
        </div>

        <ReportSummary report={report} />
        
        <CategoryScores scores={report.scores} />
        
        <FindingsList findings={report.findings} />
        
        <TransparencyNotice technicalNotes={report.technicalNotes} />
        
        <div className="report-footer">
          <p className="footer-note">
            Audit ID: {report.auditId}
          </p>
          <button className="btn-primary" onClick={handleNewAudit}>
            Analyze Another Website
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportView;