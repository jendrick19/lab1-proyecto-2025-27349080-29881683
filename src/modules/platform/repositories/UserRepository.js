const db = require('../../../../database/models');

const { User } = db.modules.platform;

const findById = async (id) => {
  return User.findByPk(id);
};

const findByUsername = async (username) => {
  return User.findOne({
    where: { username }
  });
};

const findByEmail = async (email) => {
  return User.findOne({
    where: { email }
  });
};

const findByRefreshToken = async (refreshToken) => {
  return User.findOne({
    where: { refreshToken }
  });
};

const findAndCountAll = async ({ where, offset, limit, order, include }) => {
  return User.findAndCountAll({
    where,
    offset,
    limit,
    order,
    include,
  });
};

const findAll = async ({ where, order, include }) => {
  return User.findAll({
    where,
    order,
    include,
  });
};

const create = async (payload) => {
  return User.create(payload);
};

const update = async (user, payload) => {
  return user.update(payload);
};

const save = async (user) => {
  return user.save();
};

const changeStatus = async (user, status) => {
  return user.update({ status });
};

const updateRefreshToken = async (user, refreshToken) => {
  return user.update({ refreshToken, lastLogin: new Date() });
};

const clearRefreshToken = async (user) => {
  return user.update({ refreshToken: null });
};

module.exports = {
  findById,
  findByUsername,
  findByEmail,
  findByRefreshToken,
  findAndCountAll,
  findAll,
  create,
  update,
  save,
  changeStatus,
  updateRefreshToken,
  clearRefreshToken,
};

