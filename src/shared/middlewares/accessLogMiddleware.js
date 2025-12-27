const { AccessLog } = require('../../../database/models');

/**
 * Middleware para registrar todos los accesos al API en la bitácora
 */
const logAccess = (req, res, next) => {
  // Guardar el tiempo de inicio
  const startTime = Date.now();

  // Guardar el método original res.json para interceptar la respuesta
  const originalJson = res.json;

  // Variable para guardar el status code
  let statusCode = 200;

  // Sobrescribir res.json para capturar el status code
  res.json = function(data) {
    statusCode = res.statusCode;
    return originalJson.call(this, data);
  };

  // Sobrescribir res.status para capturar el código de estado
  const originalStatus = res.status;
  res.status = function(code) {
    statusCode = code;
    return originalStatus.call(this, code);
  };

  // Cuando la respuesta termina, guardar en la bitácora
  res.on('finish', async () => {
    try {
      const responseTime = Date.now() - startTime;
      
      // Obtener IP del cliente
      const ip = req.ip || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress ||
                 (req.connection.socket ? req.connection.socket.remoteAddress : null);

      // Limpiar IP si es IPv6 localhost
      const cleanIp = ip === '::1' ? '127.0.0.1' : ip;

      // Datos del log
      const logData = {
        userId: req.userId || null, // Del middleware de autenticación
        recurso: req.originalUrl || req.url,
        accion: req.method,
        ip: cleanIp,
        userAgent: req.get('user-agent') || null,
        statusCode: statusCode,
        responseTime: responseTime
      };

      // Guardar en la base de datos de forma asíncrona (no bloquea la respuesta)
      await AccessLog.create(logData);
    } catch (error) {
      // No lanzar error para no interrumpir el flujo de la aplicación
      console.error('Error al registrar acceso en bitácora:', error);
    }
  });

  next();
};

/**
 * Middleware opcional para excluir ciertas rutas del logging
 */
const logAccessExcept = (excludedPaths = []) => {
  return (req, res, next) => {
    // Verificar si la ruta actual debe ser excluida
    const shouldExclude = excludedPaths.some(path => {
      if (typeof path === 'string') {
        return req.path === path || req.path.startsWith(path);
      }
      if (path instanceof RegExp) {
        return path.test(req.path);
      }
      return false;
    });

    if (shouldExclude) {
      return next();
    }

    // Si no está excluida, aplicar el logging
    return logAccess(req, res, next);
  };
};

module.exports = {
  logAccess,
  logAccessExcept
};

