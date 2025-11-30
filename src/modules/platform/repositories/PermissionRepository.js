const db = require('../../../../database/models');

const { Permission } = db.modules.platform;

const findById = async (id) => {
  return Permission.findByPk(id);
};

const findByKey = async (key) => {
  return Permission.findOne({
    where: { key }
  });
};

const findAndCountAll = async ({ where, offset, limit, order, include }) => {
  return Permission.findAndCountAll({
    where,
    offset,
    limit,
    order,
    include,
  });
};

const findAll = async ({ where, order, include }) => {
  return Permission.findAll({
    where,
    order,
    include,
  });
};

const create = async (payload) => {
  return Permission.create(payload);
};

const update = async (permission, payload) => {
  return permission.update(payload);
};

const save = async (permission) => {
  return permission.save();
};

module.exports = {
  findById,
  findByKey,
  findAndCountAll,
  findAll,
  create,
  update,
  save,
};

