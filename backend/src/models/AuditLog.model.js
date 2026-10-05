const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Action identifier is required'],
      trim: true,
      uppercase: true, // e.g. "AUTH_LOGIN", "STOCK_IN", "BRANCH_TRANSFER", "STOCK_ADJUST"
    },
    module: {
      type: String,
      required: [true, 'Module name is required'],
      trim: true, // e.g. "INVENTORY", "AUTH", "PURCHASE", "SALES", "BRANCH"
    },
    entity: {
      type: String,
      trim: true, // e.g. "Product", "Inventory", "Branch"
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    adminEmail: {
      type: String,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Audit logs are immutable
  }
);

auditLogSchema.index({ module: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
