const db = require('../../../../database/models');
const { Affiliation } = db.modules.bussines;

const findById = async (id) => {
  return Affiliation.findByPk(id, {
    include: [
      { model: db.modules.operative.PeopleAttended, as: 'peopleAttended' },
      { model: db.modules.bussines.Plan, as: 'plan' }
    ]
  });
};

const findAndCountAll = async ({ where, offset, limit, order }) => {
  return Affiliation.findAndCountAll({
    where,
    offset,
    limit,
    order,
    include: [
      { model: db.modules.operative.PeopleAttended, as: 'peopleAttended' },
      { model: db.modules.bussines.Plan, as: 'plan' }
    ],
    distinct: true,
  });
};

const create = async (payload) => {
  return Affiliation.create(payload);
};

const update = async (affiliation, payload) => {
  return affiliation.update(payload);
};

const save = async (affiliation) => {
  return affiliation.save();
};

module.exports = {
  findById,
  findAndCountAll,
  create,
  update,
  save,
};

