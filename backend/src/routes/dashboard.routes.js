const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateSuperAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticateSuperAdmin);

router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
