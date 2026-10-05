const ApiError = require('../utils/apiError');
const environment = require('../config/environment');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If not an instance of ApiError, normalize it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 422 : 500);
    const message = error.message || 'Internal Server Error';
    
    // Handle Mongoose duplicate key error (code 11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      let conflictMsg;
      if (field === 'SKU') {
        conflictMsg = 'Product SKU already exists. Please use a different SKU.';
      } else {
        conflictMsg = `Duplicate value for '${field}'. This value already exists.`;
      }
      error = ApiError.conflict(conflictMsg);
    } 
    // Handle Mongoose cast error (invalid ObjectId)
    else if (error.name === 'CastError') {
      error = ApiError.badRequest(`Invalid resource identifier format: ${error.path}`);
    } 
    // Handle Mongoose validation errors
    else if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((val) => val.message);
      error = ApiError.unprocessable(messages.join(', '), messages);
    } 
    // Handle JWT errors
    else if (error.name === 'JsonWebTokenError') {
      error = ApiError.unauthorized('Invalid security token');
    } else if (error.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Security token has expired');
    } else {
      error = new ApiError(statusCode, message, [], err.stack);
    }
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
    ...(environment.nodeEnv === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};

// 404 Not Found Handler for unknown API endpoints
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`API endpoint not found: ${req.method} ${req.originalUrl}`));
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
