const db = require('../../../../database/models');
const { Invoice } = db.modules.bussines;

const findById = async (id, includeItems = false, includePayments = false) => {
  const include = [];
  
  include.push({ model: db.modules.operative.PeopleAttended, as: 'peopleAttended' });
  include.push({ model: db.modules.bussines.Insurer, as: 'insurer' });
  
  if (includeItems) {
    include.push({
      model: db.modules.bussines.InvoiceItem,
      as: 'items',
      include: [{ model: db.modules.bussines.Service, as: 'service' }]
    });
  }
  
  if (includePayments) {
    include.push({ model: db.modules.bussines.Payment, as: 'payments' });
  }
  
  return Invoice.findByPk(id, { include });
};

const findAndCountAll = async ({ where, offset, limit, order }) => {
  return Invoice.findAndCountAll({
    where,
    offset,
    limit,
    order,
    include: [
      { model: db.modules.operative.PeopleAttended, as: 'peopleAttended' },
      { model: db.modules.bussines.Insurer, as: 'insurer' }
    ],
    distinct: true,
  });
};

const findByNumber = async (number) => {
  return Invoice.findOne({
    where: { number },
    include: [
      { model: db.modules.operative.PeopleAttended, as: 'peopleAttended' },
      { model: db.modules.bussines.Insurer, as: 'insurer' }
    ]
  });
};

const create = async (payload) => {
  return Invoice.create(payload);
};

const update = async (invoice, payload) => {
  return invoice.update(payload);
};

module.exports = {
  findById,
  findAndCountAll,
  findByNumber,
  create,
  update,
};

