const mongoose = require('mongoose');
const environment = require('../config/environment');
const { Admin, Branch } = require('../models');

async function seedAdmin() {
  console.log('--- Initializing Super Admin Seeding ---');

  const { email, password, name, username } = environment.initialAdmin;

  if (!email || !password) {
    console.error('[Error] INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD must be defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(environment.mongodbUri);
    console.log('[Database] Connected to MongoDB successfully.');

    // Check if any Super Admin exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }, { role: 'SUPER_ADMIN' }],
    });

    if (existingAdmin) {
      console.log(`[Info] Super Admin already exists: ${existingAdmin.email} (Username: ${existingAdmin.username})`);
      console.log('[Info] Seeding skipped to preserve existing credentials.');
    } else {
      const passwordHash = await Admin.hashPassword(password);

      const newAdmin = await Admin.create({
        name,
        username,
        email,
        passwordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
      });

      console.log(`[Success] Super Admin created successfully:`);
      console.log(`  - ID: ${newAdmin._id}`);
      console.log(`  - Name: ${newAdmin.name}`);
      console.log(`  - Email: ${newAdmin.email}`);
      console.log(`  - Username: ${newAdmin.username}`);
      console.log(`  - Role: ${newAdmin.role}`);
    }

    // Also check if an initial Head Office branch exists, create if missing
    const branchCount = await Branch.countDocuments();
    if (branchCount === 0) {
      const hoBranch = await Branch.create({
        branchCode: 'HO-MAIN',
        name: 'Head Office & Central Depot',
        address: 'Industrial Area Phase 1',
        city: 'Central City',
        state: 'State',
        pincode: '110001',
        phone: '+91 98765 43210',
        email: email,
        managerName: name,
        status: 'ACTIVE',
      });
      console.log(`[Success] Default Central Branch created: ${hoBranch.name} (${hoBranch.branchCode})`);
    }

    console.log('--- Seeding Completed Successfully ---');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Error] Seeding failed:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

seedAdmin();
