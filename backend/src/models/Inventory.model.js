const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock quantity cannot be negative'],
    },
    lastRestockedAt: { type: Date },
  },
  { timestamps: true }
);

/**
 * Compound unique index: one inventory document per branch+product.
 *
 * IMPORTANT: Before creating this index for the first time on a populated
 * database, check for duplicate (branchId + productId) combinations and
 * resolve them manually to avoid index build failure.
 *
 * Check duplicates with:
 *   db.inventories.aggregate([
 *     { $group: { _id: { branchId: "$branchId", productId: "$productId" }, count: { $sum: 1 } } },
 *     { $match: { count: { $gt: 1 } } }
 *   ])
 */
inventorySchema.index({ branchId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
