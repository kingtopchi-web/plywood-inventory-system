const mongoose = require('mongoose');
const { Branch, Product, Inventory, AuditLog, Category } = require('../models');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const { branchId } = req.query;
    const branchFilter = branchId ? { branchId: new mongoose.Types.ObjectId(branchId) } : {};

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const auditMatchToday = { module: 'INVENTORY', createdAt: { $gte: startOfToday } };
    const auditMatchMonth = { module: 'INVENTORY', createdAt: { $gte: startOfMonth } };
    const auditMatch7Days = { module: 'INVENTORY', createdAt: { $gte: sevenDaysAgo } };
    
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);
    const auditMatch12Months = { module: 'INVENTORY', createdAt: { $gte: twelveMonthsAgo } };

    if (branchId) {
      const bFilter = [
        { 'details.branchId': branchId },
        { 'details.branchId': new mongoose.Types.ObjectId(branchId) }
      ];
      auditMatchToday.$or = bFilter;
      auditMatchMonth.$or = bFilter;
      auditMatch7Days.$or = bFilter;
      auditMatch12Months.$or = bFilter;
    }

    const [
      totalBranches,
      totalProducts,
      inventorySummary,
      auditSummaryToday,
      auditSummaryMonth,
      audit7Days,
      audit12Months,
      categoryStockData
    ] = await Promise.all([
      Branch.countDocuments({ status: 'ACTIVE' }),
      Product.countDocuments({ status: 'ACTIVE' }),
      Inventory.aggregate([
        { $match: branchFilter },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        { $match: { 'product.status': 'ACTIVE' } },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$quantity' },
            activeProducts: { $sum: 1 },
            lowStock: {
              $sum: { $cond: [{ $and: [{ $gt: ['$quantity', 0] }, { $lt: ['$quantity', 10] }] }, 1, 0] }
            },
            outOfStock: { $sum: { $cond: [{ $lte: ['$quantity', 0] }, 1, 0] } },
          },
        },
      ]),
      AuditLog.aggregate([
        { $match: auditMatchToday },
        { $group: { _id: '$action', totalQuantity: { $sum: '$details.quantity' } } }
      ]),
      AuditLog.aggregate([
        { $match: auditMatchMonth },
        { $group: { _id: '$action', totalQuantity: { $sum: '$details.quantity' } } }
      ]),
      AuditLog.aggregate([
        { $match: auditMatch7Days },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              action: "$action"
            },
            total: { $sum: "$details.quantity" }
          }
        }
      ]),
      AuditLog.aggregate([
        { $match: auditMatch12Months },
        {
          $group: {
            _id: {
              month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
              action: "$action"
            },
            total: { $sum: "$details.quantity" }
          }
        }
      ]),
      Inventory.aggregate([
        { $match: branchFilter },
        {
          $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'product' }
        },
        { $unwind: '$product' },
        {
          $lookup: { from: 'categories', localField: 'product.categoryId', foreignField: '_id', as: 'category' }
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $ifNull: ['$category.name', 'Uncategorized'] },
            totalQuantity: { $sum: '$quantity' }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 }
      ])
    ]);

    const invData = inventorySummary[0] || { totalQuantity: 0, lowStock: 0, outOfStock: 0, activeProducts: 0 };
    const availableStock = Math.max(0, invData.activeProducts - invData.lowStock - invData.outOfStock);

    let todayStockIn = 0, todayStockOut = 0;
    auditSummaryToday.forEach((item) => {
      if (item._id === 'STOCK_IN') todayStockIn = item.totalQuantity;
      if (item._id === 'STOCK_OUT') todayStockOut = item.totalQuantity;
    });

    let monthlyStockIn = 0, monthlyStockOut = 0;
    auditSummaryMonth.forEach((item) => {
      if (item._id === 'STOCK_IN') monthlyStockIn = item.totalQuantity;
      if (item._id === 'STOCK_OUT') monthlyStockOut = item.totalQuantity;
    });

    // Format 7 days data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const stockActivity = {
      dates: last7Days,
      stockIn: last7Days.map(date => {
        const record = audit7Days.find(a => a._id.date === date && a._id.action === 'STOCK_IN');
        return record ? record.total : 0;
      }),
      stockOut: last7Days.map(date => {
        const record = audit7Days.find(a => a._id.date === date && a._id.action === 'STOCK_OUT');
        return record ? record.total : 0;
      })
    };

    const last12Months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      last12Months.push(`${year}-${month}`);
    }

    const monthlyStockActivity = {
      months: last12Months,
      stockIn: last12Months.map(month => {
        const record = audit12Months.find(a => a._id.month === month && a._id.action === 'STOCK_IN');
        return record ? record.total : 0;
      }),
      stockOut: last12Months.map(month => {
        const record = audit12Months.find(a => a._id.month === month && a._id.action === 'STOCK_OUT');
        return record ? record.total : 0;
      })
    };

    const categoryStock = {
      categories: categoryStockData.map(c => c._id),
      quantities: categoryStockData.map(c => c.totalQuantity)
    };

    res.json({
      success: true,
      data: {
        totalBranches,
        totalProducts,
        totalInventoryQuantity: invData.totalQuantity,
        branchActiveProducts: invData.activeProducts,
        lowStock: invData.lowStock,
        outOfStock: invData.outOfStock,
        availableStock,
        todayStockIn,
        todayStockOut,
        monthlyStockIn,
        monthlyStockOut,
        stockActivity,
        monthlyStockActivity,
        categoryStock
      },
    });
  } catch (err) {
    next(err);
  }
};
