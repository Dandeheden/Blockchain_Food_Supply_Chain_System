/**
 * Format a date string or Date object for display.
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/**
 * Shorten a blockchain hash for display.
 */
export const shortHash = (hash) => {
  if (!hash) return 'N/A';
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
};

/**
 * Return Tailwind badge class for batch status.
 */
export const statusBadgeClass = (status) => {
  switch (status) {
    case 'Normal':            return 'badge-normal';
    case 'Warning':           return 'badge-warning';
    case 'Spoilage Reported':
    case 'Spoiled':           return 'badge-spoiled';
    case 'Delivered':         return 'badge-good';
    default:                  return 'badge-info';
  }
};

/**
 * Return Tailwind badge class for condition string.
 */
export const conditionBadgeClass = (condition) => {
  switch (condition) {
    case 'Good':    return 'badge-good';
    case 'Warning': return 'badge-warning';
    case 'Spoiled': return 'badge-spoiled';
    default: return 'badge-info';
  }
};

/**
 * Map stage name to an emoji icon.
 */
export const stageIcon = (stage) => {
  const map = {
    Farmer:      '🌾',
    Processor:   '🏭',
    Distributor: '🚚',
    Retailer:    '🏪',
    Delivered:   '✅',
  };
  return map[stage] || '📦';
};

/**
 * Get colour dot for timeline node based on condition.
 */
export const conditionColor = (condition) => {
  switch (condition) {
    case 'Good':    return 'bg-green-500';
    case 'Warning': return 'bg-amber-500';
    case 'Spoiled': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};

/**
 * Friendly role display names.
 */
export const roleLabel = (role) => {
  const map = {
    farmer: 'Farmer', processor: 'Processor',
    distributor: 'Distributor', retailer: 'Retailer', admin: 'Admin/Regulator',
  };
  return map[role] || role;
};
