export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const ENDPOINTS = {
  LOGIN: '/auth/login',
  PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/profile',
  LOGOUT: '/auth/logout',
  CHANGE_PASSWORD: '/auth/change-password',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: (token) => `/auth/reset-password/${token}`,

  HEALTH: '/health',

  BRANCHES: '/branches',
  CATEGORIES: '/categories',
  SUBCATEGORIES: '/subcategories',
  BRANDS: '/brands',
  UNITS: '/units',
  PRODUCTS: '/products',

  // Inventory current stock
  INVENTORY: '/inventory',
  INVENTORY_BRANCH: (branchId) => `/inventory/branch/${branchId}`,
  INVENTORY_PRODUCT_STOCK: (branchId, productId) =>
    `/inventory/branch/${branchId}/product/${productId}`,

  // Stock operations
  STOCK_IN: '/inventory/stock-in',
  STOCK_OUT: '/inventory/stock-out',
  DELETE_INVENTORY: (id) => `/inventory/${id}`,

  // Alerts
  LOW_STOCK_ALERTS: '/inventory/alerts/low-stock',
  OUT_OF_STOCK_ALERTS: '/inventory/alerts/out-of-stock',

  // Settings
  SETTINGS: '/settings',
};
