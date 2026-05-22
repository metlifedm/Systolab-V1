import React, { createContext, useContext, useState } from 'react';

const AuditContext = createContext();

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within AuditProvider');
  }
  return context;
};

export const AuditProvider = ({ children }) => {
  const [currentAudit, setCurrentAudit] = useState(null);
  const [auditHistory, setAuditHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = {
    currentAudit,
    setCurrentAudit,
    auditHistory,
    setAuditHistory,
    loading,
    setLoading,
    error,
    setError
  };

  return (
    <AuditContext.Provider value={value}>
      {children}
    </AuditContext.Provider>
  );
};