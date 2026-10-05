const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend directory or project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // fallback to local .env if present

const environment = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/plywood_inventory_db',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET || 'plywood_inventory_super_secret_jwt_key_2026_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cookieSecret: process.env.COOKIE_SECRET || 'plywood_cookie_secret_key_change_in_production',
  initialAdmin: {
    email: process.env.INITIAL_ADMIN_EMAIL || 'admin@plywoodsystem.local',
    password: process.env.INITIAL_ADMIN_PASSWORD || 'AdminSecurePassword123!',
    name: process.env.INITIAL_ADMIN_NAME || 'Super Administrator',
    username: process.env.INITIAL_ADMIN_USERNAME || 'superadmin',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromEmail: process.env.FROM_EMAIL || 'noreply@plywoodsystem.local'
  }
};

module.exports = environment;
