const mongoose = require('mongoose');
const environment = require('../config/environment');
const Inventory = require('../models/Inventory.model');

const fixIndexes = async () => {
  try {
    await mongoose.connect(environment.mongodbUri);
    console.log('Connected to MongoDB');

    console.log('Syncing indexes for Inventory...');
    await Inventory.syncIndexes();
    console.log('Inventory indexes synced');

    console.log('Indexes fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();
