const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'National Plywood'
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  enableEmailAlerts: {
    type: Boolean,
    default: true
  },
  enableSmsAlerts: {
    type: Boolean,
    default: false
  },
  sessionTimeout: {
    type: Number,
    default: 60
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
