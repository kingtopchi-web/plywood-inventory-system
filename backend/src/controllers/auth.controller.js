const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const environment = require('../config/environment');

class AuthController {
  /**
   * POST /api/v1/auth/login
   * Login as Super Admin
   */
  async login(req, res, next) {
    try {
      const { identifier, password } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      const { admin, token } = await authService.login({
        identifier,
        password,
        ipAddress,
        userAgent,
      });

      // Set HTTP-only secure cookie for additional safety
      res.cookie('adminToken', token, {
        httpOnly: true,
        secure: environment.isProduction,
        sameSite: environment.isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return ApiResponse.success(
        res,
        {
          admin,
          token,
        },
        'Super Admin login successful'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/profile
   * Get current authenticated Super Admin profile
   */
  async getProfile(req, res, next) {
    try {
      const admin = await authService.getProfile(req.admin._id);
      return ApiResponse.success(res, { admin }, 'Admin profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Logout current Super Admin
   */
  async logout(req, res, next) {
    try {
      res.clearCookie('adminToken');
      return ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   * Request password reset token
   */
  async forgotPassword(req, res, next) {
    try {
      const { identifier } = req.body;
      const resetToken = await authService.forgotPassword(identifier);
      return ApiResponse.success(
        res,
        null,
        'If an account with that email/username exists, a password reset link has been sent.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/reset-password/:token
   * Reset password using token
   */
  async resetPassword(req, res, next) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      return ApiResponse.success(res, null, 'Password has been successfully reset. Please login with your new password.');
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST /api/v1/auth/change-password
   * Change password for current logged-in Super Admin
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.admin._id, currentPassword, newPassword);
      return ApiResponse.success(res, null, 'Password updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/auth/profile
   * Update profile (name, email)
   */
  async updateProfile(req, res, next) {
    try {
      const { name, email, profileImage, logo } = req.body;
      const updatedAdmin = await authService.updateProfile(req.admin._id, { name, email, profileImage, logo });
      return ApiResponse.success(res, { admin: updatedAdmin }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
