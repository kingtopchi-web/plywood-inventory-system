const ActivityLog = require('../models/ActivityLog');

const activityLogService = {
  /**
   * Log an activity
   * @param {Object} data 
   * @returns 
   */
  logActivity: async (data) => {
    try {
      const log = new ActivityLog(data);
      await log.save();
      return log;
    } catch (error) {
      console.error('Error logging activity:', error);
      // We do not throw to prevent breaking the main transaction flow
    }
  },

  /**
   * Get all activities with pagination and filters
   */
  getHistory: async ({ page = 1, limit = 20, search, action, entityType, branchId, productId, performedBy, fromDate, toDate }) => {
    const query = {};

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (branchId) query.branchId = branchId;
    if (productId) query.productId = productId;
    if (performedBy) query.performedBy = { $regex: performedBy, $options: 'i' };

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { entityName: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('branchId', 'name') // in case we want to show updated names occasionally
        .populate('productId', 'name SKU')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ActivityLog.countDocuments(query),
    ]);

    return {
      docs,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get activity details by ID
   */
  getHistoryById: async (id) => {
    return ActivityLog.findById(id)
      .populate('branchId', 'name branchCode')
      .populate('productId', 'name SKU');
  }
};

module.exports = activityLogService;
