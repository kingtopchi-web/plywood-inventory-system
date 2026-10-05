const Inventory = require('../models/Inventory.model');
const Branch = require('../models/Branch.model');
const Product = require('../models/Product.model');
const AuditLog = require('../models/AuditLog.model');
const activityLogService = require('./activityLogService');
const Admin = require('../models/Admin.model');
const ApiError = require('../utils/apiError');
const mongoose = require('mongoose');

class InventoryService {
  /**
   * Delete an inventory record by ID
   */
  async deleteInventory(inventoryId, performedBy) {
    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      throw ApiError.notFound('Inventory record not found');
    }
    
    await inventory.deleteOne();

    await AuditLog.create({
      action: 'INVENTORY_DELETE',
      module: 'INVENTORY',
      entity: 'Inventory',
      entityId: inventory._id,
      performedBy,
      details: { branchId: inventory.branchId, productId: inventory.productId, quantity: inventory.quantity },
    });

    return { message: 'Inventory record deleted successfully' };
  }

  /**
   * Stock In: atomically increase stock for a branch+product.
   * Creates the inventory document if it doesn't exist (upsert).
   */
  async stockIn({ branchId, productId, quantity, notes, performedBy }) {
    this._validateRequiredFields({ branchId, productId, quantity });

    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty <= 0) {
      throw ApiError.badRequest('Quantity must be greater than zero');
    }

    await this._validateBranchAndProduct(branchId, productId);

    // Upsert the inventory document, then atomically increment
    await Inventory.findOneAndUpdate(
      { branchId, productId },
      { $setOnInsert: { branchId, productId, quantity: 0 } },
      { new: true, upsert: true }
    );

    const updated = await Inventory.findOneAndUpdate(
      { branchId, productId },
      {
        $inc: { quantity: qty },
        $set: { lastRestockedAt: new Date() },
      },
      { new: true }
    );

    if (updated) {
      await AuditLog.create({
        action: 'STOCK_IN',
        module: 'INVENTORY',
        entity: 'Inventory',
        entityId: updated._id,
        performedBy,
        details: { branchId, productId, quantity: qty, notes },
      });

      // Get names for snapshot
      let adminName = 'System';
      try {
        const admin = await Admin.findById(performedBy);
        if (admin) adminName = admin.name;
      } catch(e){}

      const [branch, product] = await Promise.all([
        Branch.findById(branchId),
        Product.findById(productId),
      ]);

      await activityLogService.logActivity({
        action: 'STOCK_IN',
        entityType: 'INVENTORY',
        entityId: updated._id,
        branchId,
        productId,
        entityName: 'Inventory',
        productName: product?.name,
        sku: product?.SKU,
        quantity: qty,
        unit: 'Pcs', // Assuming Pcs or would need to fetch unit
        newStock: updated.quantity,
        previousStock: updated.quantity - qty,
        performedBy: adminName,
        adminId: performedBy,
        notes,
      });
    }

    return { success: true, inventory: updated };
  }

  /**
   * Stock Out: atomically decrease stock. Prevents negative stock.
   */
  async stockOut({ branchId, productId, quantity, notes, performedBy }) {
    this._validateRequiredFields({ branchId, productId, quantity });

    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty <= 0) {
      throw ApiError.badRequest('Quantity must be greater than zero');
    }

    await this._validateBranchAndProduct(branchId, productId);

    const current = await Inventory.findOne({ branchId, productId });
    const currentQty = current ? current.quantity : 0;

    if (currentQty < qty) {
      throw ApiError.badRequest(
        `Insufficient stock. Current stock: ${currentQty}, Requested: ${qty}`
      );
    }

    // Atomic update: only succeeds if quantity is still sufficient
    const updated = await Inventory.findOneAndUpdate(
      { branchId, productId, quantity: { $gte: qty } },
      { $inc: { quantity: -qty } },
      { new: true }
    );

    if (!updated) {
      // Reload current stock for accurate error message
      const fresh = await Inventory.findOne({ branchId, productId });
      const freshQty = fresh ? fresh.quantity : 0;
      throw ApiError.badRequest(
        `Insufficient stock. Current stock: ${freshQty}, Requested: ${qty}`
      );
    }

    await AuditLog.create({
      action: 'STOCK_OUT',
      module: 'INVENTORY',
      entity: 'Inventory',
      entityId: updated._id,
      performedBy,
      details: { branchId, productId, quantity: qty, notes },
    });

    let adminName = 'System';
    try {
      const admin = await Admin.findById(performedBy);
      if (admin) adminName = admin.name;
    } catch(e){}

    const [branchData, productData] = await Promise.all([
      Branch.findById(branchId),
      Product.findById(productId),
    ]);

    await activityLogService.logActivity({
      action: 'STOCK_OUT',
      entityType: 'INVENTORY',
      entityId: updated._id,
      branchId,
      productId,
      entityName: 'Inventory',
      productName: productData?.name,
      sku: productData?.SKU,
      quantity: qty,
      unit: 'Pcs',
      newStock: updated.quantity,
      previousStock: currentQty,
      performedBy: adminName,
      adminId: performedBy,
      notes,
    });

    // --- Dynamic Low Stock Email Alert Logic ---
    const Settings = require('../models/Settings.model');
    const emailService = require('./email.service');
    const Admin = require('../models/Admin.model'); // To get admin emails

    const settings = await Settings.findOne();
    const threshold = settings?.lowStockThreshold || 10;
    const isEmailAlertEnabled = settings?.enableEmailAlerts !== false;

    // Trigger email if stock just fell to or below threshold, and it was previously above (or just trigger if it's below)
    // Here we check if the updated quantity is <= threshold, and previous was > threshold
    if (isEmailAlertEnabled && updated.quantity <= threshold && currentQty > threshold) {
      // Find super admin email(s) to send the alert to
      const superAdmins = await Admin.find({ role: 'SUPER_ADMIN', isActive: true });
      if (superAdmins.length > 0) {
        // We need product and branch details for the email
        const [product, branch] = await Promise.all([
          Product.findById(productId),
          Branch.findById(branchId)
        ]);

        superAdmins.forEach(admin => {
          emailService.sendLowStockAlertEmail(
            admin.email,
            product?.name || 'Unknown Product',
            branch?.name || 'Unknown Branch',
            updated.quantity
          );
        });
      }
    }

    return { success: true, inventory: updated };
  }

  /**
   * Get current stock for a specific branch + product.
   */
  async getProductStock(branchId, productId) {
    if (!branchId || !productId) {
      throw ApiError.badRequest('branchId and productId are required');
    }
    const inventory = await Inventory.findOne({ branchId, productId }).populate({
      path: 'productId',
      select: 'name SKU minimumStock maximumStock sellingPrice',
    });
    return {
      branchId,
      productId,
      quantity: inventory?.quantity ?? 0,
      inventory,
    };
  }

  /**
   * Get all inventory for a branch (current stock only).
   */
  async getBranchInventory(branchId, query = {}) {
    const { page = 1, limit = 50, categoryId, brandId, search } = query;

    let filter = {};
    if (branchId) filter.branchId = new mongoose.Types.ObjectId(branchId);

    const inventory = await Inventory.find(filter)
      .populate({
        path: 'productId',
        select: 'name SKU categoryId subCategoryId brandId unitId minimumStock maximumStock sellingPrice status',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'subCategoryId', select: 'name' },
          { path: 'brandId', select: 'name' },
          { path: 'unitId', select: 'name code' },
        ],
      })
      .populate('branchId', 'name branchCode')
      .sort({ updatedAt: -1 });

    let docs = inventory.filter((row) => row.productId);

    if (categoryId) {
      docs = docs.filter(
        (row) =>
          String(row.productId.categoryId?._id || row.productId.categoryId) === String(categoryId)
      );
    }

    if (brandId) {
      docs = docs.filter(
        (row) =>
          String(row.productId.brandId?._id || row.productId.brandId) === String(brandId)
      );
    }

    if (search) {
      const term = String(search).toLowerCase();
      docs = docs.filter((row) => {
        const name = row.productId.name || '';
        const sku = row.productId.SKU || '';
        return name.toLowerCase().includes(term) || sku.toLowerCase().includes(term);
      });
    }

    const total = docs.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const paged = docs.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    const Settings = require('../models/Settings.model');
    const settings = await Settings.findOne();
    const threshold = settings?.lowStockThreshold || 10;

    // Compute stock status
    const result = paged.map((inv) => {
      let stockStatus;
      if (inv.quantity <= 0) {
        stockStatus = 'OUT_OF_STOCK';
      } else if (inv.quantity <= threshold) {
        stockStatus = 'LOW_STOCK';
      } else {
        stockStatus = 'IN_STOCK';
      }
      return { ...inv.toObject(), stockStatus };
    });

    return {
      docs: result,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
  }

  /**
   * Get all inventory across all branches (no branch filter).
   */
  async getAllInventory(query = {}) {
    return this.getBranchInventory(null, query);
  }

  /**
   * Low stock: quantity > 0 AND quantity <= minimumStock
   */
  async getLowStockItems(query = {}) {
    const { branchId } = query;
    const match = {};
    if (branchId) match.branchId = new mongoose.Types.ObjectId(branchId);

    const Settings = require('../models/Settings.model');
    const settings = await Settings.findOne();
    const threshold = settings?.lowStockThreshold || 10;

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $match: {
          $expr: {
            $and: [
              { $gt: ['$quantity', 0] },
              { $lte: ['$quantity', threshold] }
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'branches',
          localField: 'branchId',
          foreignField: '_id',
          as: 'branch',
        },
      },
      { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          branchId: 1,
          quantity: 1,
          'branch.name': 1,
          'branch.branchCode': 1,
          'product.name': 1,
          'product.SKU': 1,
          'product.minimumStock': 1,
          'product.maximumStock': 1,
        },
      },
    ];

    return Inventory.aggregate(pipeline);
  }

  /**
   * Out of stock: quantity <= 0
   */
  async getOutOfStockItems(query = {}) {
    const { branchId } = query;
    const match = { quantity: { $lte: 0 } };
    if (branchId) match.branchId = new mongoose.Types.ObjectId(branchId);

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'branches',
          localField: 'branchId',
          foreignField: '_id',
          as: 'branch',
        },
      },
      { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          branchId: 1,
          quantity: 1,
          'branch.name': 1,
          'branch.branchCode': 1,
          'product.name': 1,
          'product.SKU': 1,
          'product.minimumStock': 1,
        },
      },
    ];

    return Inventory.aggregate(pipeline);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  _validateRequiredFields({ branchId, productId, quantity }) {
    if (!branchId || !productId || quantity === undefined || quantity === null) {
      throw ApiError.badRequest('branchId, productId, and quantity are required');
    }
  }

  async _validateBranchAndProduct(branchId, productId) {
    const [branch, product] = await Promise.all([
      Branch.findById(branchId),
      Product.findById(productId),
    ]);
    if (!branch) throw ApiError.badRequest('Branch not found');
    if (!product) throw ApiError.badRequest('Product not found');
  }
}

module.exports = new InventoryService();
