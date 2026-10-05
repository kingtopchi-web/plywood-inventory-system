const ApiResponse = require('../utils/apiResponse');
const activityLogService = require('../services/activityLogService');
const Admin = require('../models/Admin.model');

function createCatalogController(Model, options = {}) {
  const {
    resourceName = 'Record',
    searchFields = ['name', 'code'],
    populate = [],
    mapBody = (body) => body,
  } = options;

  const applyPopulate = (query) => {
    (populate || []).forEach((p) => {
      if (typeof p === 'string') query.populate(p);
      else query.populate(p);
    });
    return query;
  };

  const getBody = (req) => mapBody({ ...req.body });

  return {
    create: async (req, res, next) => {
      try {
        const doc = new Model(getBody(req));
        await doc.save();

        let adminName = 'System';
        try {
          if (req.admin?._id) {
            const admin = await Admin.findById(req.admin._id);
            if (admin) adminName = admin.name;
          }
        } catch(e) {}

        await activityLogService.logActivity({
          action: 'CREATE',
          entityType: resourceName.toUpperCase(),
          entityId: doc._id,
          entityName: doc.name || resourceName,
          sku: doc.SKU || '',
          performedBy: adminName,
          adminId: req.admin?._id,
        });

        return ApiResponse.created(res, doc, `${resourceName} created successfully`);
      } catch (error) {
        // Handle duplicate key (unique constraint violation) with friendly message
        if (error.code === 11000) {
          const field = Object.keys(error.keyValue || {})[0] || 'field';
          let msg;
          if (field === 'SKU') {
            msg = 'Product SKU already exists. Please use a different SKU.';
          } else {
            msg = `Duplicate value for '${field}'. This value already exists.`;
          }
          const ApiError = require('../utils/apiError');
          return next(ApiError.conflict(msg));
        }
        next(error);
      }
    },

    getAll: async (req, res, next) => {
      try {
        const { page = 1, limit = 10, search, status, sort = '-createdAt' } = req.query;
        const query = {};
        if (status) query.status = status;
        if (search && searchFields.length) {
          query.$or = searchFields.map((field) => ({
            [field]: { $regex: search, $options: 'i' },
          }));
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const modelQuery = applyPopulate(
          Model.find(query).sort(sort).skip((pageNum - 1) * limitNum).limit(limitNum)
        );

        const [docs, total] = await Promise.all([
          modelQuery.exec(),
          Model.countDocuments(query),
        ]);

        return ApiResponse.success(res, {
          docs,
          totalDocs: total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        }, `${resourceName}s retrieved successfully`);
      } catch (error) {
        next(error);
      }
    },

    getById: async (req, res, next) => {
      try {
        const doc = await applyPopulate(Model.findById(req.params.id)).exec();
        if (!doc) return ApiResponse.notFound(res, `${resourceName} not found`);
        return ApiResponse.success(res, doc, `${resourceName} retrieved successfully`);
      } catch (error) {
        next(error);
      }
    },

    update: async (req, res, next) => {
      try {
        const doc = await Model.findByIdAndUpdate(req.params.id, getBody(req), {
          new: true,
          runValidators: true,
        });
        if (!doc) return ApiResponse.notFound(res, `${resourceName} not found`);

        let adminName = 'System';
        try {
          if (req.admin?._id) {
            const admin = await Admin.findById(req.admin._id);
            if (admin) adminName = admin.name;
          }
        } catch(e) {}

        await activityLogService.logActivity({
          action: 'UPDATE',
          entityType: resourceName.toUpperCase(),
          entityId: doc._id,
          entityName: doc.name || resourceName,
          sku: doc.SKU || '',
          performedBy: adminName,
          adminId: req.admin?._id,
        });

        return ApiResponse.success(res, doc, `${resourceName} updated successfully`);
      } catch (error) {
        next(error);
      }
    },

    toggleStatus: async (req, res, next) => {
      try {
        const doc = await Model.findById(req.params.id);
        if (!doc) return ApiResponse.notFound(res, `${resourceName} not found`);
        doc.status = doc.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await doc.save();
        return ApiResponse.success(res, doc, `${resourceName} status updated to ${doc.status}`);
      } catch (error) {
        next(error);
      }
    },

    remove: async (req, res, next) => {
      try {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) return ApiResponse.notFound(res, `${resourceName} not found`);

        let adminName = 'System';
        try {
          if (req.admin?._id) {
            const admin = await Admin.findById(req.admin._id);
            if (admin) adminName = admin.name;
          }
        } catch(e) {}

        await activityLogService.logActivity({
          action: 'DELETE',
          entityType: resourceName.toUpperCase(),
          entityId: doc._id,
          entityName: doc.name || resourceName,
          sku: doc.SKU || '',
          performedBy: adminName,
          adminId: req.admin?._id,
        });

        return ApiResponse.success(res, null, `${resourceName} deleted successfully`);
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = { createCatalogController };
