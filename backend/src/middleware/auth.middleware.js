const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/apiError');
const Admin = require('../models/Admin.model');

/**
 * Authentication Middleware: Enforces that the incoming request is made by
 * the authenticated SUPER_ADMIN.
 */
const authenticateSuperAdmin = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Fallback to cookie
    else if (req.cookies && req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication required. Please login as Super Admin.'));
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return next(ApiError.unauthorized('Invalid or expired token. Please login again.'));
    }

    // Single source of truth lookup
    const admin = await Admin.findById(decoded.id).select('-passwordHash');

    if (!admin) {
      return next(ApiError.unauthorized('Admin account not found or has been removed.'));
    }

    if (!admin.isActive) {
      return next(ApiError.forbidden('Admin account is inactive. Please contact system administrator.'));
    }

    if (admin.role !== 'SUPER_ADMIN') {
      return next(ApiError.forbidden('Access forbidden. Only SUPER_ADMIN is authorized.'));
    }

    // Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    next(ApiError.internal(`Authentication error: ${error.message}`));
  }
};

module.exports = {
  authenticateSuperAdmin,
};
