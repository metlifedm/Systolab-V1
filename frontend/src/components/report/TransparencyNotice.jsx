import React from 'react';

const TransparencyNotice = ({ technicalNotes }) => {
  return (
    <div className="transparency-notice">
      <h3 className="notice-title">📋 Technical Transparency</h3>
      
      <div className="notice-content">
        <p className="notice-text">
          <strong>Analysis Methodology:</strong> SYSTOLAB analyzes publicly accessible static 
          HTML structure. Some modern websites load content dynamically using JavaScript, which 
          may affect signal detection and interpretation accuracy.
        </p>

        <p className="notice-text">
          <strong>Data Sources:</strong> All findings are generated exclusively from publicly 
          accessible website signals and publicly visible business information without affiliation 
          to Google, search engines, or third-party ranking systems.
        </p>

        {technicalNotes && technicalNotes.length > 0 && (
          <div className="technical-notes">
            <strong>Technical Notes:</strong>
            <ul className="notes-list">
              {technicalNotes.map((note, index) => (
                <li key={index} className={`note-item note-${note.type}`}>
                  {note.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransparencyNotice;