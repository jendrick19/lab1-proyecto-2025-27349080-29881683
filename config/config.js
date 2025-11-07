require('dotenv').config();

module.exports = {
  development: {

    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, 
    dialect: "mysql"
  },
  test: {

    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST || 'clinica', // Ejemplo de test DB
    host: process.env.DB_HOST,
    dialect: "mysql"
  },
  production: {
  
    username: process.env.DB_USERNAME_PROD,
    password: process.env.DB_PASSWORD_PROD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST_PROD,
    dialect: "mysql"
  }
};
