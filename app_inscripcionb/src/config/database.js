// src/config/database.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, // ✅ Cambiado de DB_PASS a DB_PASSWORD
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: console.log,
    logging: false,
    dialectOptions:
      process.env.NODE_ENV === "production"
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 5, // Aumentado de 5 a 10
      min: parseInt(process.env.DB_POOL_MIN) || 1, // Aumentado de 0 a 2
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000, // Aumentado de 30000 a 60000
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },
  }
);

module.exports = sequelize;
