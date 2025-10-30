// config/config.js
require('dotenv').config(); // Sigue siendo útil para desarrollo local

module.exports = {
  development: {
    username: process.env.DB_USER,
    // Asegúrate que la variable de entorno se llame DB_PASSWORD
    password: process.env.DB_PASSWORD || 68867805,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432, // Añadir default por si acaso
    dialect: 'postgres',
    logging: console.log // Mantener logs para desarrollo
  },
  test: { // Configuración para pruebas (ajústala si la usas)
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST || process.env.DB_NAME + '_test', // Usar variable si existe
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false // Desactivar logs en pruebas
  },
 production: {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  logging: false,
  
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false  // ← Simplificado para RDS
    }
  },
  
  pool: {
    max: parseInt(process.env.DB_POOL_MAX_CLI) || 5,
    min: parseInt(process.env.DB_POOL_MIN_CLI) || 0,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE_CLI) || 60000,  // ← 60 segundos
    idle: parseInt(process.env.DB_POOL_IDLE_CLI) || 10000
  }
}
};