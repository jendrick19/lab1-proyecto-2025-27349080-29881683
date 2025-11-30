const db = require('../../../../database/models');

const { UserRole } = db.modules.platform;
const { Role } = db.modules.platform;

const findById = async (id) => {
  return UserRole.findByPk(id);
};

const findByUserId = async (userId, includeRole = false) => {
  const include = includeRole ? [{
    model: Role,
    as: 'role',
    required: false
  }] : [];

  return UserRole.findAll({
    where: {
      userId
    },
    include
  });
};

const findByUserIdAndRoleId = async (userId, roleId) => {
  return UserRole.findOne({
    where: {
      userId,
      roleId
    }
  });
};

const findAndCountAll = async ({ where, offset, limit, order, include }) => {
  return UserRole.findAndCountAll({
    where,
    offset,
    limit,
    order,
    include,
  });
};

const findAll = async ({ where, order, include }) => {
  return UserRole.findAll({
    where,
    order,
    include,
  });
};

const create = async (payload) => {
  return UserRole.create(payload);
};

const update = async (userRole, payload) => {
  return userRole.update(payload);
};

const save = async (userRole) => {
  return userRole.save();
};

const remove = async (userRole) => {
  return userRole.destroy();
};

module.exports = {
  findById,
  findByUserId,
  findByUserIdAndRoleId,
  findAndCountAll,
  findAll,
  create,
  update,
  save,
  remove,
};

