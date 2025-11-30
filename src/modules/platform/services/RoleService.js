const roleRepository = require('../repositories/RoleRepository');
const { NotFoundError, BusinessLogicError } = require('../../../shared/errors/CustomErrors');

const getRoleById = async (id) => {
  const role = await roleRepository.findById(id);

  if (!role) {
    throw new NotFoundError('Rol no encontrado');
  }

  return role;
};

const getRoleByName = async (name) => {
  const role = await roleRepository.findByName(name);

  if (!role) {
    throw new NotFoundError('Rol no encontrado');
  }

  return role;
};

const listRoles = async ({ where, order, include }) => {
  return roleRepository.findAll({ where, order, include });
};

const createRole = async (roleData) => {
  const existingRole = await roleRepository.findByName(roleData.name);

  if (existingRole) {
    throw new BusinessLogicError('El rol ya existe');
  }

  return roleRepository.create(roleData);
};

const updateRole = async (role, payload) => {
  if (payload.name && payload.name !== role.name) {
    const existingRole = await roleRepository.findByName(payload.name);
    if (existingRole) {
      throw new BusinessLogicError('El nombre del rol ya está en uso');
    }
  }

  return roleRepository.update(role, payload);
};

module.exports = {
  getRoleById,
  getRoleByName,
  listRoles,
  createRole,
  updateRole,
};

