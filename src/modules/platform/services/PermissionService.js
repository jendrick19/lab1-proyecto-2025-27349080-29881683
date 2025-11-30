const permissionRepository = require('../repositories/PermissionRepository');
const { NotFoundError, BusinessLogicError } = require('../../../shared/errors/CustomErrors');

const getPermissionById = async (id) => {
  const permission = await permissionRepository.findById(id);

  if (!permission) {
    throw new NotFoundError('Permiso no encontrado');
  }

  return permission;
};

const getPermissionByKey = async (key) => {
  const permission = await permissionRepository.findByKey(key);

  if (!permission) {
    throw new NotFoundError('Permiso no encontrado');
  }

  return permission;
};

const listPermissions = async ({ where, order, include }) => {
  return permissionRepository.findAll({ where, order, include });
};

const createPermission = async (permissionData) => {
  const existingPermission = await permissionRepository.findByKey(permissionData.key);

  if (existingPermission) {
    throw new BusinessLogicError('El permiso ya existe');
  }

  return permissionRepository.create(permissionData);
};

const updatePermission = async (permission, payload) => {
  if (payload.key && payload.key !== permission.key) {
    const existingPermission = await permissionRepository.findByKey(payload.key);
    if (existingPermission) {
      throw new BusinessLogicError('La clave del permiso ya está en uso');
    }
  }

  return permissionRepository.update(permission, payload);
};

module.exports = {
  getPermissionById,
  getPermissionByKey,
  listPermissions,
  createPermission,
  updatePermission,
};

