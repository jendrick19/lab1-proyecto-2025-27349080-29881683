const tokenService = require('../services/TokenService');
const { UnauthorizedError } = require('../../../shared/errors/CustomErrors');

/**
 * Middleware para autenticar usuarios mediante JWT
 * Extrae el token del header Authorization y verifica su validez
 * Agrega req.user con información del usuario autenticado
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        codigo: 401,
        mensaje: 'Token de autenticación no proporcionado',
        tipo: 'UnauthorizedError',
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        codigo: 401,
        mensaje: 'Formato de token inválido. Debe ser: Bearer <token>',
        tipo: 'UnauthorizedError',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        codigo: 401,
        mensaje: 'Token no proporcionado',
        tipo: 'UnauthorizedError',
      });
    }

    let decoded;

    try {
      decoded = tokenService.verifyToken(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          codigo: 401,
          mensaje: 'Token expirado',
          tipo: 'TokenExpiredError',
          code: 'TOKEN_EXPIRED',
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          codigo: 401,
          mensaje: 'Token inválido',
          tipo: 'JsonWebTokenError',
        });
      }

      throw error;
    }

    // Agregar información del usuario al request
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      roles: decoded.roles || [],
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
};

