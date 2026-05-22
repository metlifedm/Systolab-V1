import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for full audit
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const auditAPI = {
  /**
   * Execute new audit
   */
  executeAudit: async (websiteUrl, gbpLink = null) => {
    try {
      const response = await api.post('/audit/execute', {
        websiteUrl,
        gbpLink
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { 
        state: 'error', 
        error: { message: 'Failed to execute audit' } 
      };
    }
  },

  /**
   * Get audit report by ID
   */
  getAuditReport: async (auditId) => {
    try {
      const response = await api.get(`/audit/${auditId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { 
        state: 'error', 
        error: { message: 'Failed to fetch audit report' } 
      };
    }
  },

  /**
   * Get audit history for URL
   */
  getAuditHistory: async (websiteUrl) => {
    try {
      const response = await api.get('/audit/history', {
        params: { websiteUrl }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { 
        state: 'error', 
        error: { message: 'Failed to fetch audit history' } 
      };
    }
  },

  /**
   * Get findings by category
   */
  getFindingsByCategory: async (auditId) => {
    try {
      const response = await api.get(`/audit/${auditId}/findings`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { 
        state: 'error', 
        error: { message: 'Failed to fetch findings' } 
      };
    }
  }
};

export default api;