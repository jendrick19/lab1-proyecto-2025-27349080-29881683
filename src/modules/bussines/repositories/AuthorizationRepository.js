const db = require('../../../../database/models');
const { Authorization } = db.modules.bussines;

const findById = async (id) => {
  return Authorization.findByPk(id, {
    include: [
      { model: db.modules.clinic.Order, as: 'order' },
      { model: db.modules.bussines.Plan, as: 'plan' }
    ]
  });
};

const findAndCountAll = async ({ where, offset, limit, order }) => {
  return Authorization.findAndCountAll({
    where,
    offset,
    limit,
    order,
    include: [
      { model: db.modules.clinic.Order, as: 'order' },
      { model: db.modules.bussines.Plan, as: 'plan' }
    ],
    distinct: true,
  });
};

const create = async (payload) => {
  return Authorization.create(payload);
};

const update = async (authorization, payload) => {
  return authorization.update(payload);
};

module.exports = {
  findById,
  findAndCountAll,
  create,
  update,
};

