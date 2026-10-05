const mongoose = require('mongoose');
const environment = require('./environment');

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(environment.mongodbUri, {
      autoIndex: !environment.isProduction, // Build indexes in dev, manage separately in prod
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected. Attempting reconnection...');
    });

    return conn;
  } catch (error) {
    console.error(`[Database Error] Could not connect to MongoDB: ${error.message}`);
    // In dev, do not crash outright so developers can start server while spinning up local Mongo
    if (environment.isProduction) {
      process.exit(1);
    }
  }
};

module.exports = connectDatabase;
