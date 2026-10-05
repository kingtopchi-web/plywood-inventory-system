const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateSuperAdmin } = require('../middleware/auth.middleware');
const { validateLoginInput } = require('../validators');

// Public route: Super Admin Login
router.post('/login', validateLoginInput, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes: Require SUPER_ADMIN role
router.get('/profile', authenticateSuperAdmin, authController.getProfile);
router.put('/profile', authenticateSuperAdmin, authController.updateProfile);
router.post('/change-password', authenticateSuperAdmin, authController.changePassword);
router.post('/logout', authenticateSuperAdmin, authController.logout);

module.exports = router;
