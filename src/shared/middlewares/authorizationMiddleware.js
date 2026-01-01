/**
 * Middleware de autorización para verificar roles y permisos
 * 
 * IMPORTANTE: Estos middlewares deben usarse DESPUÉS del middleware authenticate
 * ya que dependen de req.user que es establecido por authenticate
 */

/**
 * Verificar que el usuario tenga un rol específico
 * @param {string} role - Nombre del rol requerido
 */
const hasRole = (role) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          error: 'No autorizado',
          message: 'Debe estar autenticado para acceder a este recurso'
        });
      }

      // Obtener roles del token (están en el payload del JWT)
      const userRoles = req.user.roles || [];

      // Verificar si el usuario tiene el rol requerido
      if (!userRoles.includes(role)) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: `Se requiere el rol '${role}' para acceder a este recurso`
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware hasRole:', error);
      return res.status(500).json({
        error: 'Error del servidor',
        message: 'Error al verificar autorización'
      });
    }
  };
};

/**
 * Verificar que el usuario tenga al menos uno de los roles especificados
 * @param {string[]} roles - Array de roles aceptados
 */
const hasAnyRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'No autorizado',
          message: 'Debe estar autenticado para acceder a este recurso'
        });
      }

      const userRoles = req.user.roles || [];

      // Verificar si el usuario tiene al menos uno de los roles
      const hasRole = roles.some(role => userRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: `Se requiere uno de los siguientes roles: ${roles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware hasAnyRole:', error);
      return res.status(500).json({
        error: 'Error del servidor',
        message: 'Error al verificar autorización'
      });
    }
  };
};

/**
 * Verificar que el usuario tenga todos los roles especificados
 * @param {string[]} roles - Array de roles requeridos
 */
const hasAllRoles = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'No autorizado',
          message: 'Debe estar autenticado para acceder a este recurso'
        });
      }

      const userRoles = req.user.roles || [];

      // Verificar si el usuario tiene todos los roles
      const hasAllRoles = roles.every(role => userRoles.includes(role));

      if (!hasAllRoles) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: `Se requieren todos estos roles: ${roles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware hasAllRoles:', error);
      return res.status(500).json({
        error: 'Error del servidor',
        message: 'Error al verificar autorización'
      });
    }
  };
};

/**
 * Verificar que el usuario tenga un permiso específico
 * @param {string} permission - Clave del permiso requerido
 */
const hasPermission = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'No autorizado',
          message: 'Debe estar autenticado para acceder a este recurso'
        });
      }

      // Obtener permisos del token
      const userPermissions = req.user.permissions || [];

      // Verificar si el usuario tiene el permiso
      if (!userPermissions.includes(permission)) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: `Se requiere el permiso '${permission}' para acceder a este recurso`
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware hasPermission:', error);
      return res.status(500).json({
        error: 'Error del servidor',
        message: 'Error al verificar autorización'
      });
    }
  };
};

/**
 * Verificar que el usuario tenga al menos uno de los permisos especificados
 * @param {string[]} permissions - Array de permisos aceptados
 */
const hasAnyPermission = (permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'No autorizado',
          message: 'Debe estar autenticado para acceder a este recurso'
        });
      }

      const userPermissions = req.user.permissions || [];

      // Verificar si el usuario tiene al menos uno de los permisos
      const hasPermission = permissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: `Se requiere uno de los siguientes permisos: ${permissions.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware hasAnyPermission:', error);
      return res.status(500).json({
        error: 'Error del servidor',
        message: 'Error al verificar autorización'
      });
    }
  };
};

/**
 * Verificar que el usuario tenga todos los permisos especificados
 * @param {string[]} permissions - Array de permisos requeridos
 */
const hasAllPermissions = (permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'No autorizado',
          message: 'Debe estar autenticado para acceder a este recurso'
        });
      }

      const userPermissions = req.user.permissions || [];

      // Verificar si el usuario tiene todos los permisos
      const hasAllPerms = permissions.every(permission => 
        userPermissions.includes(permission)
      );

      if (!hasAllPerms) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: `Se requieren todos estos permisos: ${permissions.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware hasAllPermissions:', error);
      return res.status(500).json({
        error: 'Error del servidor',
        message: 'Error al verificar autorización'
      });
    }
  };
};

/**
 * Middleware para verificar que el usuario sea administrador
 * Atajo para hasRole('administrador')
 */
const isAdmin = hasRole('administrador');

/**
 * Middleware para verificar que el usuario sea profesional
 * Atajo para hasRole('profesional')
 */
const isProfessional = hasRole('profesional');

/**
 * Middleware para verificar que el usuario sea cajero
 * Atajo para hasRole('cajero')
 */
const isCashier = hasRole('cajero');

/**
 * Middleware para verificar que el usuario sea auditor
 * Atajo para hasRole('auditor')
 */
const isAuditor = hasRole('auditor');

module.exports = {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  isProfessional,
  isCashier,
  isAuditor
};

