/**
 * Helpers para verificar permisos y roles del usuario
 * Útiles para verificaciones programáticas en controladores y servicios
 */

/**
 * Verificar si el usuario tiene un rol específico
 * @param {Object} user - Objeto de usuario (de req.user)
 * @param {string} role - Nombre del rol a verificar
 * @returns {boolean}
 */
const userHasRole = (user, role) => {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
};

/**
 * Verificar si el usuario tiene al menos uno de los roles especificados
 * @param {Object} user - Objeto de usuario (de req.user)
 * @param {string[]} roles - Array de roles a verificar
 * @returns {boolean}
 */
const userHasAnyRole = (user, roles) => {
  if (!user || !user.roles || !Array.isArray(roles)) return false;
  return roles.some(role => user.roles.includes(role));
};

/**
 * Verificar si el usuario tiene todos los roles especificados
 * @param {Object} user - Objeto de usuario (de req.user)
 * @param {string[]} roles - Array de roles a verificar
 * @returns {boolean}
 */
const userHasAllRoles = (user, roles) => {
  if (!user || !user.roles || !Array.isArray(roles)) return false;
  return roles.every(role => user.roles.includes(role));
};

/**
 * Verificar si el usuario tiene un permiso específico
 * @param {Object} user - Objeto de usuario (de req.user)
 * @param {string} permission - Clave del permiso a verificar
 * @returns {boolean}
 */
const userHasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

/**
 * Verificar si el usuario tiene al menos uno de los permisos especificados
 * @param {Object} user - Objeto de usuario (de req.user)
 * @param {string[]} permissions - Array de permisos a verificar
 * @returns {boolean}
 */
const userHasAnyPermission = (user, permissions) => {
  if (!user || !user.permissions || !Array.isArray(permissions)) return false;
  return permissions.some(permission => user.permissions.includes(permission));
};

/**
 * Verificar si el usuario tiene todos los permisos especificados
 * @param {Object} user - Objeto de usuario (de req.user)
 * @param {string[]} permissions - Array de permisos a verificar
 * @returns {boolean}
 */
const userHasAllPermissions = (user, permissions) => {
  if (!user || !user.permissions || !Array.isArray(permissions)) return false;
  return permissions.every(permission => user.permissions.includes(permission));
};

/**
 * Verificar si el usuario es administrador
 * @param {Object} user - Objeto de usuario (de req.user)
 * @returns {boolean}
 */
const isAdmin = (user) => {
  return userHasRole(user, 'administrador');
};

/**
 * Verificar si el usuario es profesional
 * @param {Object} user - Objeto de usuario (de req.user)
 * @returns {boolean}
 */
const isProfessional = (user) => {
  return userHasRole(user, 'profesional');
};

/**
 * Verificar si el usuario es cajero
 * @param {Object} user - Objeto de usuario (de req.user)
 * @returns {boolean}
 */
const isCashier = (user) => {
  return userHasRole(user, 'cajero');
};

/**
 * Verificar si el usuario es auditor
 * @param {Object} user - Objeto de usuario (de req.user)
 * @returns {boolean}
 */
const isAuditor = (user) => {
  return userHasRole(user, 'auditor');
};

/**
 * Obtener todos los roles del usuario
 * @param {Object} user - Objeto de usuario (de req.user)
 * @returns {string[]}
 */
const getUserRoles = (user) => {
  return user && user.roles ? user.roles : [];
};

/**
 * Obtener todos los permisos del usuario
 * @param {Object} user - Objeto de usuario (de req.user)
 * @returns {string[]}
 */
const getUserPermissions = (user) => {
  return user && user.permissions ? user.permissions : [];
};

/**
 * Verificar si el usuario puede realizar una acción sobre un recurso
 * @param {Object} user - Objeto de usuario (de req.user)
 * @param {string} resource - Nombre del recurso (ej: 'appointments', 'invoices')
 * @param {string} action - Acción a realizar (ej: 'read', 'create', 'update', 'delete')
 * @returns {boolean}
 */
const userCan = (user, resource, action) => {
  const permission = `${resource}.${action}`;
  return userHasPermission(user, permission);
};

/**
 * Verificar si el usuario puede realizar cualquiera de las acciones sobre un recurso
 * @param {Object} user - Objeto de usuario (de req.user)
 * @param {string} resource - Nombre del recurso
 * @param {string[]} actions - Array de acciones
 * @returns {boolean}
 */
const userCanAny = (user, resource, actions) => {
  if (!Array.isArray(actions)) return false;
  const permissions = actions.map(action => `${resource}.${action}`);
  return userHasAnyPermission(user, permissions);
};

/**
 * Verificar si el usuario puede realizar todas las acciones sobre un recurso
 * @param {Object} user - Objeto de usuario (de req.user)
 * @param {string} resource - Nombre del recurso
 * @param {string[]} actions - Array de acciones
 * @returns {boolean}
 */
const userCanAll = (user, resource, actions) => {
  if (!Array.isArray(actions)) return false;
  const permissions = actions.map(action => `${resource}.${action}`);
  return userHasAllPermissions(user, permissions);
};

/**
 * Lanzar error si el usuario no tiene el permiso
 * @param {Object} user - Objeto de usuario (de req.user)
 * @param {string} permission - Permiso requerido
 * @param {string} message - Mensaje de error personalizado
 * @throws {Error}
 */
const requirePermission = (user, permission, message) => {
  if (!userHasPermission(user, permission)) {
    throw new Error(message || `Se requiere el permiso '${permission}' para realizar esta acción`);
  }
};

/**
 * Lanzar error si el usuario no tiene el rol
 * @param {Object} user - Objeto de usuario (de req.user)
 * @param {string} role - Rol requerido
 * @param {string} message - Mensaje de error personalizado
 * @throws {Error}
 */
const requireRole = (user, role, message) => {
  if (!userHasRole(user, role)) {
    throw new Error(message || `Se requiere el rol '${role}' para realizar esta acción`);
  }
};

module.exports = {
  userHasRole,
  userHasAnyRole,
  userHasAllRoles,
  userHasPermission,
  userHasAnyPermission,
  userHasAllPermissions,
  isAdmin,
  isProfessional,
  isCashier,
  isAuditor,
  getUserRoles,
  getUserPermissions,
  userCan,
  userCanAny,
  userCanAll,
  requirePermission,
  requireRole
};

