const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  SKU: { type: String, required: true, unique: true, uppercase: true, trim: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  thickness: { type: String },
  length: { type: Number },
  width: { type: Number },
  grade: { type: String },
  basePrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  minimumStock: { type: Number, default: 0 },
  maximumStock: { type: Number },
  tax: { type: Number, default: 0 },
  hsnSac: { type: String },
  description: { type: String },
  image: { type: String },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
