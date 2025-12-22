const db = require('../../../../database/models');
const { Payment } = db.modules.bussines;
const { Sequelize } = require('sequelize');

const findByInvoiceId = async (invoiceId) => {
  return Payment.findAll({
    where: { invoiceId },
    order: [['date', 'DESC']]
  });
};

const findById = async (id) => {
  return Payment.findByPk(id, {
    include: [{ model: db.modules.bussines.Invoice, as: 'invoice' }]
  });
};

const findAndCountAll = async ({ where, offset, limit, order }) => {
  return Payment.findAndCountAll({
    where,
    offset,
    limit,
    order,
    include: [{ model: db.modules.bussines.Invoice, as: 'invoice' }],
    distinct: true,
  });
};

// Calcular suma de pagos completados para una factura
const getCompletedPaymentsTotal = async (invoiceId) => {
  const result = await Payment.findOne({
    where: {
      invoiceId,
      status: 'completado'
    },
    attributes: [
      [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('amount')), 0), 'total']
    ],
    raw: true
  });
  return parseFloat(result?.total || 0);
};

const create = async (payload) => {
  return Payment.create(payload);
};

const update = async (payment, payload) => {
  return payment.update(payload);
};

module.exports = {
  findByInvoiceId,
  findById,
  findAndCountAll,
  getCompletedPaymentsTotal,
  create,
  update,
};

