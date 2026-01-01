const AuthService = require('../../modules/platform/services/AuthService');

/**
 * Middleware de autenticación JWT
 * Verifica que el token sea válido y adjunta el usuario al request
 */
const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación no proporcionado'
      });
    }

    // Verificar formato: "Bearer <token>"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Formato de token inválido. Use: Bearer <token>'
      });
    }

    const token = parts[1];

    // Verificar token
    const decoded = await AuthService.verifyToken(token);

    // Verificar que sea un access token
    if (decoded.type !== 'access') {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Tipo de token inválido'
      });
    }

    // Obtener usuario completo
    const user = await AuthService.getUserById(decoded.id);

    // Adjuntar usuario al request con roles y permisos del token
    req.user = {
      ...user.toJSON(),
      roles: decoded.roles || [],
      permissions: decoded.permissions || []
    };
    req.userId = user.id;

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);

    if (error.message === 'Token expirado') {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.message === 'Token inválido') {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token inválido',
        code: 'TOKEN_INVALID'
      });
    }

    return res.status(401).json({
      error: 'No autorizado',
      message: 'Error al verificar autenticación'
    });
  }
};

/**
 * Middleware opcional de autenticación
 * Si hay token lo valida, si no hay continúa sin usuario
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1];
    const decoded = await AuthService.verifyToken(token);

    if (decoded.type === 'access') {
      const user = await AuthService.getUserById(decoded.id);
      req.user = user;
      req.userId = user.id;
    }

    next();
  } catch (error) {
    // Si hay error, simplemente continuar sin usuario
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate
};

