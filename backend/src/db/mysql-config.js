const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

module.exports = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'boitsibiso',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
};