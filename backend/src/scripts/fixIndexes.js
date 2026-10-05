const mongoose = require('mongoose');
const environment = require('../config/environment');
const Branch = require('../models/Branch.model');
const Product = require('../models/Product.model');

const fixIndexes = async () => {
  try {
    await mongoose.connect(environment.mongodbUri);
    console.log('Connected to MongoDB');

    console.log('Syncing indexes for Branch...');
    await Branch.syncIndexes();
    console.log('Branch indexes synced');

    console.log('Syncing indexes for Product...');
    await Product.syncIndexes();
    console.log('Product indexes synced');

    console.log('Indexes fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();
