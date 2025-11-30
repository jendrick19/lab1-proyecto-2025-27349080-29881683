const userRoleRepository = require('../repositories/UserRoleRepository');
const roleRepository = require('../repositories/RoleRepository');
const userRepository = require('../repositories/UserRepository');
const { NotFoundError, BusinessLogicError } = require('../../../shared/errors/CustomErrors');

const getUserRoleById = async (id) => {
  const userRole = await userRoleRepository.findById(id);

  if (!userRole) {
    throw new NotFoundError('Asignación de rol no encontrada');
  }

  return userRole;
};

const getUserRolesByUserId = async (userId, includeRole = false) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  return userRoleRepository.findByUserId(userId, includeRole);
};

const assignRoleToUser = async (userId, roleId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  const role = await roleRepository.findById(roleId);
  if (!role) {
    throw new NotFoundError('Rol no encontrado');
  }

  const existingUserRole = await userRoleRepository.findByUserIdAndRoleId(userId, roleId);
  if (existingUserRole) {
    throw new BusinessLogicError('El usuario ya tiene este rol asignado');
  }

  return userRoleRepository.create({
    userId,
    roleId
  });
};

const removeRoleFromUser = async (userId, roleId) => {
  const userRole = await userRoleRepository.findByUserIdAndRoleId(userId, roleId);

  if (!userRole) {
    throw new NotFoundError('El usuario no tiene este rol asignado');
  }

  return userRoleRepository.remove(userRole);
};

const getUserRolesWithDetails = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  return userRoleRepository.findByUserId(userId, true);
};

module.exports = {
  getUserRoleById,
  getUserRolesByUserId,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRolesWithDetails,
};

