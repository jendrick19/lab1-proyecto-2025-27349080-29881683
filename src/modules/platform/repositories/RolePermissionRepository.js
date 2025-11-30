const db = require('../../../../database/models');

const { RolePermission } = db.modules.platform;
const { Permission } = db.modules.platform;

const findById = async (id) => {
  return RolePermission.findByPk(id);
};

const findByRoleId = async (roleId, includePermission = false) => {
  const include = includePermission ? [{
    model: Permission,
    as: 'permission',
    required: false
  }] : [];

  return RolePermission.findAll({
    where: {
      roleId
    },
    include
  });
};

const findByRoleIdAndPermissionId = async (roleId, permissionId) => {
  return RolePermission.findOne({
    where: {
      roleId,
      permissionId
    }
  });
};

const findAndCountAll = async ({ where, offset, limit, order, include }) => {
  return RolePermission.findAndCountAll({
    where,
    offset,
    limit,
    order,
    include,
  });
};

const findAll = async ({ where, order, include }) => {
  return RolePermission.findAll({
    where,
    order,
    include,
  });
};

const create = async (payload) => {
  return RolePermission.create(payload);
};

const update = async (rolePermission, payload) => {
  return rolePermission.update(payload);
};

const save = async (rolePermission) => {
  return rolePermission.save();
};

const remove = async (rolePermission) => {
  return rolePermission.destroy();
};

module.exports = {
  findById,
  findByRoleId,
  findByRoleIdAndPermissionId,
  findAndCountAll,
  findAll,
  create,
  update,
  save,
  remove,
};

