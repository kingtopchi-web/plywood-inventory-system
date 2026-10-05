const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, '../backend/src/controllers');
const routesDir = path.join(__dirname, '../backend/src/routes');

const controllerContent = `const { Supplier, PurchaseOrder, PurchaseReceipt, SupplierPayment } = require('../models');
const inventoryService = require('../services/inventory.service');
const ApiError = require('../utils/apiError');

exports.createSupplier = async (req, res, next) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

exports.getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: suppliers });
  } catch (error) {
    next(error);
  }
};

exports.createPurchaseOrder = async (req, res, next) => {
  try {
    const { supplierId, branchId, orderDate, expectedDelivery, items, notes } = req.body;
    
    // Calculate total amount
    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += item.total;
    });

    // Generate PO Number
    const count = await PurchaseOrder.countDocuments();
    const poNumber = \`PO-\${new Date().getFullYear()}-\${(count + 1).toString().padStart(4, '0')}\`;

    const po = new PurchaseOrder({
      poNumber,
      supplierId,
      branchId,
      orderDate,
      expectedDelivery,
      items,
      totalAmount,
      notes,
      createdBy: req.admin._id
    });

    await po.save();
    res.status(201).json({ success: true, data: po });
  } catch (error) {
    next(error);
  }
};

exports.getPurchaseOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.supplierId) filter.supplierId = req.query.supplierId;
    if (req.query.status) filter.status = req.query.status;

    const pos = await PurchaseOrder.find(filter)
      .populate('supplierId', 'name company')
      .populate('branchId', 'name')
      .populate('items.productId', 'name SKU')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: pos });
  } catch (error) {
    next(error);
  }
};

exports.createPurchaseReceipt = async (req, res, next) => {
  try {
    const { purchaseOrderId, items, referenceNo, notes } = req.body;
    const adminId = req.admin._id;

    const po = await PurchaseOrder.findById(purchaseOrderId);
    if (!po) throw ApiError.notFound('Purchase order not found');
    if (po.status === 'RECEIVED' || po.status === 'CANCELLED') {
      throw ApiError.badRequest('Cannot receive against this purchase order status');
    }

    const receiptCount = await PurchaseReceipt.countDocuments();
    const receiptNumber = \`PR-\${new Date().getFullYear()}-\${(receiptCount + 1).toString().padStart(4, '0')}\`;

    const receipt = new PurchaseReceipt({
      receiptNumber,
      purchaseOrderId,
      supplierId: po.supplierId,
      branchId: po.branchId,
      items,
      referenceNo,
      notes,
      createdBy: adminId
    });

    let allFullyReceived = true;
    let anyReceived = false;

    // Process each item and add stock
    for (const receiptItem of items) {
      const poItem = po.items.find(i => i.productId.toString() === receiptItem.productId.toString());
      if (!poItem) throw ApiError.badRequest(\`Product \${receiptItem.productId} is not part of this PO\`);

      const remainingQty = poItem.quantity - poItem.receivedQuantity;
      if (receiptItem.receivedQuantity > remainingQty) {
        throw ApiError.badRequest(\`Cannot receive more than ordered for product \${receiptItem.productId}\`);
      }

      if (receiptItem.receivedQuantity > 0) {
        anyReceived = true;
        poItem.receivedQuantity += receiptItem.receivedQuantity;
        
        // Add physical stock via central engine
        await inventoryService.processStockMovement({
          branchId: po.branchId,
          productId: receiptItem.productId,
          transactionType: 'STOCK_IN',
          quantity: receiptItem.receivedQuantity,
          referenceId: receiptNumber,
          notes: \`Purchase receipt against \${po.poNumber}\`,
          adminId: adminId,
          idempotencyKey: \`PR-\${receiptNumber}-\${receiptItem.productId}\`
        });
      }

      if (poItem.receivedQuantity < poItem.quantity) {
        allFullyReceived = false;
      }
    }

    if (!anyReceived) throw ApiError.badRequest('No quantities received');

    po.status = allFullyReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED';
    
    await receipt.save();
    await po.save();

    res.status(201).json({ success: true, data: receipt });
  } catch (error) {
    next(error);
  }
};

exports.createSupplierPayment = async (req, res, next) => {
  try {
    const { supplierId, purchaseOrderId, totalAmount, paidAmount, paymentMethod, reference, notes } = req.body;
    
    const count = await SupplierPayment.countDocuments();
    const paymentNumber = \`SPY-\${new Date().getFullYear()}-\${(count + 1).toString().padStart(4, '0')}\`;

    const payment = new SupplierPayment({
      paymentNumber,
      supplierId,
      purchaseOrderId,
      totalAmount,
      paidAmount,
      paymentMethod,
      reference,
      notes,
      createdBy: req.admin._id
    });

    await payment.save();
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};
`;

const routesContent = `const express = require('express');
const router = express.Router();
const purchasesController = require('../controllers/purchases.controller');
const { authenticateSuperAdmin } = require('../middlewares/auth.middleware');

router.use(authenticateSuperAdmin);

// Suppliers
router.post('/suppliers', purchasesController.createSupplier);
router.get('/suppliers', purchasesController.getSuppliers);

// Purchase Orders
router.post('/orders', purchasesController.createPurchaseOrder);
router.get('/orders', purchasesController.getPurchaseOrders);

// Purchase Receipts
router.post('/receipts', purchasesController.createPurchaseReceipt);

// Supplier Payments
router.post('/payments', purchasesController.createSupplierPayment);

module.exports = router;
`;

fs.writeFileSync(path.join(controllersDir, 'purchases.controller.js'), controllerContent);
fs.writeFileSync(path.join(routesDir, 'purchases.routes.js'), routesContent);

console.log('Controllers and routes generated successfully.');
