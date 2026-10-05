const mongoose = require('mongoose');
const ApiResponse = require('../utils/apiResponse');

class HealthController {
  async check(req, res, next) {
    try {
      const dbState = mongoose.connection.readyState;
      const states = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting',
      };

      const health = {
        status: dbState === 1 ? 'OK' : 'DEGRADED',
        service: 'Plywood Inventory Management System API',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: states[dbState] || 'Unknown',
          connected: dbState === 1,
        },
      };

      return ApiResponse.success(res, health, 'System is healthy');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HealthController();
