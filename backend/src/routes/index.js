const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const healthRoutes = require('./health.routes');
const inventoryRoutes = require('./inventory.routes');
const dashboardRoutes = require('./dashboard.routes');
const settingsRoutes = require('./settings.routes');
const historyRoutes = require('./history.routes');

const branchRoutes = require('./branch.routes');
const categoryRoutes = require('./category.routes');
const subcategoryRoutes = require('./subcategory.routes');
const brandRoutes = require('./brand.routes');
const unitRoutes = require('./unit.routes');
const productRoutes = require('./product.routes');

// Core API Routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/history', historyRoutes);

// Master Catalog
router.use('/branches', branchRoutes);
router.use('/categories', categoryRoutes);
router.use('/subcategories', subcategoryRoutes);
router.use('/brands', brandRoutes);
router.use('/units', unitRoutes);
router.use('/products', productRoutes);

module.exports = router;
