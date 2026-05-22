/**
 * Format date to human-readable string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format execution duration
 */
export const formatDuration = (milliseconds) => {
  if (!milliseconds) return '0ms';
  
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const ms = milliseconds % 1000;
  
  return `${seconds}.${ms}s`;
};

/**
 * Format URL for display (remove protocol)
 */
export const formatURL = (url) => {
  if (!url) return '';
  
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Get score color based on level
 */
export const getScoreColor = (level) => {
  const colors = {
    'excellent': '#10b981',
    'good': '#3b82f6',
    'needs_improvement': '#f59e0b',
    'critical': '#ef4444'
  };
  
  return colors[level] || '#6b7280';
};

/**
 * Get priority icon
 */
export const getPriorityIcon = (priority) => {
  const icons = {
    'critical': '🔴',
    'high': '🟠',
    'medium': '🟡',
    'low': '🔵',
    'info': 'ℹ️'
  };
  
  return icons[priority] || '•';
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};