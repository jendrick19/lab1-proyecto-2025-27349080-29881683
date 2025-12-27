const express = require('express');
const routes = require('./routes');
const errorHandler = require('./shared/middlewares/errorHandler');
const { logAccess } = require('./shared/middlewares/accessLogMiddleware');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging (bitácora de accesos)
// Se aplica a todas las rutas para registrar los accesos
app.use(logAccess);

app.use(routes);
app.use(errorHandler);

module.exports = app;
