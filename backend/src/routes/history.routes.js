const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { authenticateSuperAdmin } = require('../middleware/auth.middleware');

router.use(authenticateSuperAdmin);

router.get('/', historyController.getHistory);
router.get('/:id', historyController.getHistoryById);

module.exports = router;
