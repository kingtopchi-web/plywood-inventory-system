const app = require('./src/app');
const environment = require('./src/config/environment');
const connectDatabase = require('./src/config/db');

const startServer = async () => {
  // Connect to Database
  await connectDatabase();

  const server = app.listen(environment.port, () => {
    console.log('==================================================');
    console.log(` PLYWOOD INVENTORY MANAGEMENT SYSTEM - BACKEND`);
    console.log('==================================================');
    console.log(` Environment : ${environment.nodeEnv}`);
    console.log(` Server URL  : http://localhost:${environment.port}`);
    console.log(` Admin URL   : ${environment.clientUrl}`);
    console.log(` API Base    : http://localhost:${environment.port}/api/v1`);
    console.log(` Role        : SUPER_ADMIN ONLY`);
    console.log('==================================================');
  });

  // Graceful Shutdown
  const handleShutdown = (signal) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down backend server...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();
