const express = require('express');
const routes = require('./routes');
const errorHandler = require('./shared/middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

module.exports = app;

