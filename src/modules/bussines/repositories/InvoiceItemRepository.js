const db = require('../../../../database/models');
const { InvoiceItem } = db.modules.bussines;

const findByInvoiceId = async (invoiceId) => {
  return InvoiceItem.findAll({
    where: { invoiceId },
    include: [{ model: db.modules.bussines.Service, as: 'service' }],
    order: [['id', 'ASC']]
  });
};

const findById = async (id) => {
  return InvoiceItem.findByPk(id, {
    include: [
      { model: db.modules.bussines.Invoice, as: 'invoice' },
      { model: db.modules.bussines.Service, as: 'service' }
    ]
  });
};

const findAndCountAll = async ({ where, offset, limit, order }) => {
  return InvoiceItem.findAndCountAll({
    where,
    offset,
    limit,
    order,
    include: [
      { model: db.modules.bussines.Invoice, as: 'invoice' },
      { model: db.modules.bussines.Service, as: 'service' }
    ],
    distinct: true,
  });
};

const create = async (payload) => {
  return InvoiceItem.create(payload);
};

const createBulk = async (items) => {
  return InvoiceItem.bulkCreate(items);
};

const update = async (item, payload) => {
  return item.update(payload);
};

const remove = async (id) => {
  const item = await InvoiceItem.findByPk(id);
  if (item) {
    return item.destroy();
  }
  return null;
};

const removeByInvoiceId = async (invoiceId) => {
  return InvoiceItem.destroy({ where: { invoiceId } });
};

module.exports = {
  findByInvoiceId,
  findById,
  findAndCountAll,
  create,
  createBulk,
  update,
  remove,
  removeByInvoiceId,
};
