const { UnauthorizedError } = require('../../../shared/errors/CustomErrors');

/**
 * Middleware factory para verificar roles
 * Crea un middleware que verifica si el usuario tiene alguno de los roles permitidos
 * @param {...string} allowedRoles - Roles permitidos
 * @returns {Function} - Middleware function
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          codigo: 401,
          mensaje: 'Usuario no autenticado',
          tipo: 'UnauthorizedError',
        });
      }

      const userRoles = req.user.roles || [];

      if (userRoles.length === 0) {
        return res.status(403).json({
          codigo: 403,
          mensaje: 'Usuario sin roles asignados',
          tipo: 'ForbiddenError',
        });
      }

      const hasRole = allowedRoles.some(role => userRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({
          codigo: 403,
          mensaje: `No tienes permisos para acceder a este recurso. Roles requeridos: ${allowedRoles.join(', ')}`,
          tipo: 'ForbiddenError',
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware factory para verificar permisos
 * Crea un middleware que verifica si el usuario tiene un permiso específico
 * @param {string} permissionKey - Clave del permiso requerido
 * @returns {Function} - Middleware function
 */
const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          codigo: 401,
          mensaje: 'Usuario no autenticado',
          tipo: 'UnauthorizedError',
        });
      }

      // TODO: Implementar verificación de permisos cuando se implemente la lógica
      // Por ahora, solo verificamos roles
      // En el futuro, aquí se consultaría la BD para obtener los permisos del usuario
      // basándose en sus roles y la tabla RolePermission

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireRole,
  requirePermission,
};

