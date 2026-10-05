/**
 * Format currency in Indian Rupees (INR)
 */
export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Format date in readable format
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Format date with time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Format plywood dimensions: 8x4, 7x4, etc.
 */
export const formatDimensions = (dimensions) => {
  if (!dimensions) return 'Standard (8x4)';
  if (typeof dimensions === 'string') return dimensions;
  if (dimensions.label) return dimensions.label;
  if (dimensions.lengthFt && dimensions.widthFt) {
    return `${dimensions.lengthFt}x${dimensions.widthFt} ft`;
  }
  return 'Standard (8x4)';
};
