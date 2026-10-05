const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({

  name: { type: String, required: true, trim: true },
  branchCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, lowercase: true, trim: true },
  managerName: { type: String },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    
}, { timestamps: true });

module.exports = mongoose.model("Branch", branchSchema);
