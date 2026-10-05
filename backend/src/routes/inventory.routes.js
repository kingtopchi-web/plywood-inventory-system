const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventory.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware.authenticateSuperAdmin);

// Stock operations
router.post('/stock-in', controller.stockIn);
router.post('/stock-out', controller.stockOut);

// Current stock queries
router.get('/', controller.getAllInventory);
router.get('/branch/:branchId', controller.getBranchInventory);
router.get('/branch/:branchId/product/:productId', controller.getProductStock);
router.delete('/:id', controller.deleteInventory);

// Alerts
router.get('/alerts/low-stock', controller.getLowStockAlerts);
router.get('/alerts/out-of-stock', controller.getOutOfStockAlerts);

module.exports = router;
