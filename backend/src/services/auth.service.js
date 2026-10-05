const { Admin, AuditLog } = require('../models');
const { generateToken } = require('../utils/jwt');
const ApiError = require('../utils/apiError');
const crypto = require('crypto');
const emailService = require('./email.service');

class AuthService {
  /**
   * Super Admin Login
   */
  async login({ identifier, password, ipAddress, userAgent }) {
    if (!identifier || !password) {
      throw ApiError.badRequest('Please provide email/username and password');
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Find admin by email or username
    const admin = await Admin.findOne({
      $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
    }).select('+passwordHash');

    if (!admin) {
      throw ApiError.unauthorized('Invalid login credentials');
    }

    if (!admin.isActive) {
      throw ApiError.forbidden('Your administrator account has been disabled.');
    }

    if (admin.role !== 'SUPER_ADMIN') {
      throw ApiError.forbidden('Access denied. Super Administrator credentials required.');
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid login credentials');
    }

    // Generate JWT token
    const token = generateToken({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });

    // Update last login
    admin.lastLoginAt = new Date();
    await admin.save();

    // Log the successful login in AuditLog
    await AuditLog.create({
      action: 'ADMIN_LOGIN_SUCCESS',
      module: 'AUTH',
      entity: 'Admin',
      entityId: admin._id,
      performedBy: admin._id,
      adminEmail: admin.email,
      ipAddress,
      userAgent,
      details: { loginTime: admin.lastLoginAt },
    }).catch((err) => console.error('Failed to write audit log:', err));

    return {
      admin: admin.toJSON(),
      token,
    };
  }

  /**
   * Get Super Admin profile
   */
  async getProfile(adminId) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw ApiError.notFound('Super Admin profile not found');
    }
    return admin.toJSON();
  }

  /**
   * Forgot Password
   */
  async forgotPassword(identifier) {
    if (!identifier) {
      throw ApiError.badRequest('Please provide email or username');
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const admin = await Admin.findOne({
      $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
    });

    if (!admin) {
      return null;
    }

    if (!admin.isActive) {
      throw ApiError.forbidden('Your administrator account has been disabled.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    admin.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await admin.save();
    
    // Send email using Nodemailer
    await emailService.sendPasswordResetEmail(admin.email, resetToken);
    
    return resetToken;
  }

  /**
   * Reset Password
   */
  async resetPassword(resetToken, newPassword) {
    if (!resetToken || !newPassword) {
      throw ApiError.badRequest('Token and new password are required');
    }

    if (newPassword.length < 6) {
      throw ApiError.badRequest('Password must be at least 6 characters long');
    }

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      throw ApiError.badRequest('Invalid or expired password reset token');
    }

    admin.passwordHash = await Admin.hashPassword(newPassword);
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    await AuditLog.create({
      action: 'ADMIN_PASSWORD_RESET',
      module: 'AUTH',
      entity: 'Admin',
      entityId: admin._id,
      performedBy: admin._id,
      adminEmail: admin.email,
      details: { resetTime: new Date() },
    }).catch((err) => console.error('Failed to write audit log:', err));
    
    return true;
  }

  /**
   * Change Password
   */
  async changePassword(adminId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest('Current and new password are required');
    }

    if (newPassword.length < 6) {
      throw ApiError.badRequest('New password must be at least 6 characters long');
    }

    const admin = await Admin.findById(adminId).select('+passwordHash');
    if (!admin) {
      throw ApiError.notFound('Super Admin profile not found');
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Incorrect current password');
    }

    admin.passwordHash = await Admin.hashPassword(newPassword);
    await admin.save();

    await AuditLog.create({
      action: 'ADMIN_PASSWORD_CHANGE',
      module: 'AUTH',
      entity: 'Admin',
      entityId: admin._id,
      performedBy: admin._id,
      adminEmail: admin.email,
      details: { changeTime: new Date() },
    }).catch((err) => console.error('Failed to write audit log:', err));

    return true;
  }

  /**
   * Update Profile (Name, Email)
   */
  async updateProfile(adminId, { name, email, profileImage, logo }) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw ApiError.notFound('Super Admin profile not found');
    }

    if (email && email !== admin.email) {
      // check if email exists
      const existingEmail = await Admin.findOne({ email });
      if (existingEmail) {
        throw ApiError.badRequest('Email is already in use by another account');
      }
      admin.email = email;
    }

    if (name) {
      admin.name = name;
    }
    
    if (profileImage !== undefined) {
      admin.profileImage = profileImage;
    }
    
    if (logo !== undefined) {
      admin.logo = logo;
    }

    await admin.save();

    await AuditLog.create({
      action: 'ADMIN_PROFILE_UPDATE',
      module: 'AUTH',
      entity: 'Admin',
      entityId: admin._id,
      performedBy: admin._id,
      adminEmail: admin.email,
      details: { updateTime: new Date() },
    }).catch((err) => console.error('Failed to write audit log:', err));

    return admin.toJSON();
  }
}

module.exports = new AuthService();
