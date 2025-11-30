const rolePermissionRepository = require('../repositories/RolePermissionRepository');
const roleRepository = require('../repositories/RoleRepository');
const permissionRepository = require('../repositories/PermissionRepository');
const { NotFoundError, BusinessLogicError } = require('../../../shared/errors/CustomErrors');

const getRolePermissionById = async (id) => {
  const rolePermission = await rolePermissionRepository.findById(id);

  if (!rolePermission) {
    throw new NotFoundError('Asignación de permiso no encontrada');
  }

  return rolePermission;
};

const getRolePermissionsByRoleId = async (roleId, includePermission = false) => {
  const role = await roleRepository.findById(roleId);

  if (!role) {
    throw new NotFoundError('Rol no encontrado');
  }

  return rolePermissionRepository.findByRoleId(roleId, includePermission);
};

const assignPermissionToRole = async (roleId, permissionId) => {
  const role = await roleRepository.findById(roleId);
  if (!role) {
    throw new NotFoundError('Rol no encontrado');
  }

  const permission = await permissionRepository.findById(permissionId);
  if (!permission) {
    throw new NotFoundError('Permiso no encontrado');
  }

  const existingRolePermission = await rolePermissionRepository.findByRoleIdAndPermissionId(roleId, permissionId);
  if (existingRolePermission) {
    throw new BusinessLogicError('El rol ya tiene este permiso asignado');
  }

  return rolePermissionRepository.create({
    roleId,
    permissionId
  });
};

const removePermissionFromRole = async (roleId, permissionId) => {
  const rolePermission = await rolePermissionRepository.findByRoleIdAndPermissionId(roleId, permissionId);

  if (!rolePermission) {
    throw new NotFoundError('El rol no tiene este permiso asignado');
  }

  return rolePermissionRepository.remove(rolePermission);
};

const getRolePermissionsWithDetails = async (roleId) => {
  const role = await roleRepository.findById(roleId);

  if (!role) {
    throw new NotFoundError('Rol no encontrado');
  }

  return rolePermissionRepository.findByRoleId(roleId, true);
};

module.exports = {
  getRolePermissionById,
  getRolePermissionsByRoleId,
  assignPermissionToRole,
  removePermissionFromRole,
  getRolePermissionsWithDetails,
};

