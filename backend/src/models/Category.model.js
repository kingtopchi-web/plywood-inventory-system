const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({

  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
