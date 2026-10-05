const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const environment = require('./config/environment');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration - strict origin matching for admin frontend
app.use(
  cors({
    origin: environment.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
  })
);

// Body Parsing & Cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(environment.cookieSecret));

// HTTP Request Logger
if (environment.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Disable HTTP caching for all API responses to prevent stale 304 responses
app.use('/api/v1', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// API Mount Point (v1)
app.use('/api/v1', apiRoutes);

// Root Health / Info Check
app.get('/', (req, res) => {
  res.json({
    service: 'Plywood Inventory Management System API',
    version: '1.0.0',
    role: 'SUPER_ADMIN_BACKEND',
    status: 'ONLINE',
  });
});

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
