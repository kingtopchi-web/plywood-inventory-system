const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../backend/src/models');
const controllersDir = path.join(__dirname, '../backend/src/controllers');
const routesDir = path.join(__dirname, '../backend/src/routes');

// MODELS
const supplierModel = `const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  GST: { type: String },
  paymentTerms: { type: String },
  openingBalance: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
`;

const purchaseOrderModel = `const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  receivedQuantity: { type: Number, default: 0 },
  rate: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  orderDate: { type: Date, required: true },
  expectedDelivery: { type: Date },
  items: [poItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['DRAFT', 'SENT', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'], 
    default: 'DRAFT' 
  },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
`;

const purchaseReceiptModel = `const mongoose = require('mongoose');

const receiptItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  receivedQuantity: { type: Number, required: true },
  rejectedQuantity: { type: Number, default: 0 }
});

const purchaseReceiptSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  receiptDate: { type: Date, default: Date.now },
  items: [receiptItemSchema],
  referenceNo: { type: String }, // Vendor invoice no, etc
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseReceipt', purchaseReceiptSchema);
`;

const supplierPaymentModel = `const mongoose = require('mongoose');

const supplierPaymentSchema = new mongoose.Schema({
  paymentNumber: { type: String, required: true, unique: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'UPI', 'Bank', 'Card', 'Cheque', 'Other'],
    required: true 
  },
  paymentDate: { type: Date, default: Date.now },
  reference: { type: String },
  status: { type: String, enum: ['COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'], default: 'COMPLETED' },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

module.exports = mongoose.model('SupplierPayment', supplierPaymentSchema);
`;

fs.writeFileSync(path.join(modelsDir, 'Supplier.model.js'), supplierModel);
fs.writeFileSync(path.join(modelsDir, 'PurchaseOrder.model.js'), purchaseOrderModel);
fs.writeFileSync(path.join(modelsDir, 'PurchaseReceipt.model.js'), purchaseReceiptModel);
fs.writeFileSync(path.join(modelsDir, 'SupplierPayment.model.js'), supplierPaymentModel);

console.log('Models created successfully.');
