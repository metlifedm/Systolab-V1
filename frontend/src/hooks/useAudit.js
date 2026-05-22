import { useState } from 'react';
import { auditAPI } from '../services/api';

export const useAuditExecution = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const executeAudit = async (websiteUrl, gbpLink = null) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await auditAPI.executeAudit(websiteUrl, gbpLink);
      
      if (response.state === 'success') {
        setResult(response.data);
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Audit execution failed', {
          cause: response.error || undefined
        });
      }
    } catch (err) {
      const errorMessage = err.error?.message || err.message || 'An unexpected error occurred';
      setError(errorMessage);
      throw new Error(errorMessage, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setResult(null);
  };

  return {
    executeAudit,
    loading,
    error,
    result,
    reset
  };
};