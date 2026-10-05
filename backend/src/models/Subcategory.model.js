const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema({

  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    
}, { timestamps: true });

module.exports = mongoose.model("Subcategory", subcategorySchema);
