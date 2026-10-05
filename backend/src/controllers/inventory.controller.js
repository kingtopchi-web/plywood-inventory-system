const inventoryService = require('../services/inventory.service');
const Inventory = require('../models/Inventory.model');
const mongoose = require('mongoose');
const ApiResponse = require('../utils/apiResponse');

/**
 * POST /inventory/stock-in
 * Body: { branchId, productId, quantity, notes }
 */
exports.stockIn = async (req, res, next) => {
  try {
    const { branchId, productId, quantity, notes } = req.body;
    const result = await inventoryService.stockIn({
      branchId,
      productId,
      quantity,
      notes,
      performedBy: req.admin._id,
    });
    return ApiResponse.success(res, result, 'Stock In processed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /inventory/stock-out
 * Body: { branchId, productId, quantity, notes }
 */
exports.stockOut = async (req, res, next) => {
  try {
    const { branchId, productId, quantity, notes } = req.body;
    const result = await inventoryService.stockOut({
      branchId,
      productId,
      quantity,
      notes,
      performedBy: req.admin._id,
    });
    return ApiResponse.success(res, result, 'Stock Out processed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /inventory/branch/:branchId
 * Current stock for a specific branch.
 */
exports.getBranchInventory = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const result = await inventoryService.getBranchInventory(branchId, req.query);
    return ApiResponse.success(res, result, 'Inventory retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /inventory
 * Current stock across all branches.
 */
exports.getAllInventory = async (req, res, next) => {
  try {
    const result = await inventoryService.getAllInventory(req.query);
    return ApiResponse.success(res, result, 'Inventory retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /inventory/branch/:branchId/product/:productId
 * Current stock for a specific product in a branch.
 */
exports.getProductStock = async (req, res, next) => {
  try {
    const { branchId, productId } = req.params;
    const result = await inventoryService.getProductStock(branchId, productId);
    return ApiResponse.success(res, result, 'Current stock retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /inventory/alerts/low-stock
 * Items where quantity > 0 AND quantity <= minimumStock.
 */
exports.getLowStockAlerts = async (req, res, next) => {
  try {
    const items = await inventoryService.getLowStockItems(req.query);
    return ApiResponse.success(res, items, 'Low stock alerts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /inventory/alerts/out-of-stock
 * Items where quantity <= 0.
 */
exports.getOutOfStockAlerts = async (req, res, next) => {
  try {
    const items = await inventoryService.getOutOfStockItems(req.query);
    return ApiResponse.success(res, items, 'Out of stock items retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /inventory/:id
 * Delete an inventory record completely
 */
exports.deleteInventory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await inventoryService.deleteInventory(id, req.admin._id);
    return ApiResponse.success(res, result, 'Inventory record deleted successfully');
  } catch (error) {
    next(error);
  }
};
