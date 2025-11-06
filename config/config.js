// config/config.js (VERSIÓN CORREGIDA)

// 1. Cargamos las variables del archivo .env
require('dotenv').config();

module.exports = {
  development: {
    // Accedemos a process.env directamente para la máxima compatibilidad
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, 
    dialect: "mysql"
  },
  test: {
    // Usaríamos una base de datos diferente para testing, pero mantenemos el mismo dialecto
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST || 'lab1_medicos_test', // Ejemplo de test DB
    host: process.env.DB_HOST,
    dialect: "mysql"
  },
  production: {
    // La configuración de producción, que usaría diferentes variables de entorno
    username: process.env.DB_USERNAME_PROD,
    password: process.env.DB_PASSWORD_PROD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST_PROD,
    dialect: "mysql"
  }
};