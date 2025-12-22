const db = require('../../../../database/models');
const { Service } = db.modules.bussines;

const findByCode = async (code) => {
  return Service.findByPk(code);
};

const findAndCountAll = async ({ where, offset, limit, order }) => {
  return Service.findAndCountAll({
    where,
    offset,
    limit,
    order,
    distinct: true,
  });
};

const create = async (payload) => {
  return Service.create(payload);
};

const update = async (service, payload) => {
  return service.update(payload);
};

module.exports = {
  findByCode,
  findAndCountAll,
  create,
  update,
};

