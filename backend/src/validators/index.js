/**
 * Input validation helpers and schemas for incoming requests
 */
const ApiError = require('../utils/apiError');

const validateEmail = (email) => {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(String(email).toLowerCase());
};

const validateLoginInput = (req, res, next) => {
  const { identifier, password } = req.body;
  const errors = [];

  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    errors.push('Email or username is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return next(ApiError.unprocessable('Validation failed', errors));
  }

  next();
};

module.exports = {
  validateEmail,
  validateLoginInput,
};
