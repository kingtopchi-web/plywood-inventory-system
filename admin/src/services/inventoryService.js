import api from './api';
import { ENDPOINTS } from '../constants/apiEndpoints';

const inventoryService = {
  /**
   * Stock In: increase quantity for a branch+product.
   * @param {{ branchId, productId, quantity, notes }} data
   */
  stockIn: async (data) => {
    const res = await api.post(ENDPOINTS.STOCK_IN, data);
    return res;
  },

  /**
   * Stock Out: decrease quantity for a branch+product.
   * @param {{ branchId, productId, quantity, notes }} data
   */
  stockOut: async (data) => {
    const res = await api.post(ENDPOINTS.STOCK_OUT, data);
    return res;
  },

  /**
   * Get current inventory across all branches.
   */
  getAllInventory: async (params = {}) => {
    const res = await api.get(ENDPOINTS.INVENTORY, { params });
    return res;
  },

  /**
   * Get current inventory for a specific branch.
   */
  getBranchInventory: async (branchId, params = {}) => {
    const res = await api.get(ENDPOINTS.INVENTORY_BRANCH(branchId), { params });
    return res;
  },

  /**
   * Get current stock for a specific product in a branch.
   */
  getProductStock: async (branchId, productId) => {
    const res = await api.get(ENDPOINTS.INVENTORY_PRODUCT_STOCK(branchId, productId));
    return res;
  },

  /**
   * Get low stock alerts.
   */
  getLowStockAlerts: async (params = {}) => {
    const res = await api.get(ENDPOINTS.LOW_STOCK_ALERTS, { params });
    return res;
  },

  /**
   * Get out of stock alerts.
   */
  getOutOfStockAlerts: async (params = {}) => {
    const res = await api.get(ENDPOINTS.OUT_OF_STOCK_ALERTS, { params });
    return res;
  },

  /**
   * Delete an inventory record
   */
  deleteInventory: async (id) => {
    const res = await api.delete(ENDPOINTS.DELETE_INVENTORY(id));
    return res;
  },
};

export default inventoryService;
