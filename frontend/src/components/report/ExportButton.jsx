import React, { useState } from 'react';

const ExportButton = ({ report }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    
    try {
      // Create JSON export
      const exportData = {
        websiteUrl: report.websiteUrl,
        executionTimestamp: report.executionTimestamp,
        overallScore: report.scores.overall.score,
        scores: report.scores,
        findings: report.findings,
        summary: report.summary
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `systolab-report-${report.auditId}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button 
      className="btn-secondary export-btn" 
      onClick={handleExport}
      disabled={exporting}
    >
      {exporting ? 'Exporting...' : '📥 Export Report (JSON)'}
    </button>
  );
};

export default ExportButton;