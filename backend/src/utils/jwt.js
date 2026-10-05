const jwt = require('jsonwebtoken');
const environment = require('../config/environment');

const generateToken = (payload, options = {}) => {
  return jwt.sign(payload, environment.jwt.secret, {
    expiresIn: environment.jwt.expiresIn,
    ...options,
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, environment.jwt.secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
