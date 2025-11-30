const db = require('../../../../database/models');

const { Role } = db.modules.platform;

const findById = async (id) => {
  return Role.findByPk(id);
};

const findByName = async (name) => {
  return Role.findOne({
    where: { name }
  });
};

const findAndCountAll = async ({ where, offset, limit, order, include }) => {
  return Role.findAndCountAll({
    where,
    offset,
    limit,
    order,
    include,
  });
};

const findAll = async ({ where, order, include }) => {
  return Role.findAll({
    where,
    order,
    include,
  });
};

const create = async (payload) => {
  return Role.create(payload);
};

const update = async (role, payload) => {
  return role.update(payload);
};

const save = async (role) => {
  return role.save();
};

module.exports = {
  findById,
  findByName,
  findAndCountAll,
  findAll,
  create,
  update,
  save,
};

