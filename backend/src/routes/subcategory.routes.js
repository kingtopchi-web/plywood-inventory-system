const express = require('express');
const router = express.Router();
const controller = require('../controllers/subcategory.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware.authenticateSuperAdmin);

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.patch('/:id/status', controller.toggleStatus);

router.delete('/:id', controller.remove);
module.exports = router;

