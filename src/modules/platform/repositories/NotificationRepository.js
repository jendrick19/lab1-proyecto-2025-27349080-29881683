const { Op } = require('sequelize');
const db = require('../../../../database/models');
const { Notification } = db.modules.platform;

const findById = async (id) => {
  return Notification.findByPk(id, {
    include: [
      { model: db.modules.operative.PeopleAttended, as: 'peopleAttended' },
      { model: db.modules.operative.Appointment, as: 'appointment' },
      { model: db.modules.clinic.Result, as: 'result' },
      { model: db.modules.bussines.Invoice, as: 'invoice' }
    ]
  });
};

const findAndCountAll = async ({ where, offset, limit, order, include }) => {
  const defaultInclude = [
    { model: db.modules.operative.PeopleAttended, as: 'peopleAttended' },
    { model: db.modules.operative.Appointment, as: 'appointment', required: false },
    { model: db.modules.clinic.Result, as: 'result', required: false },
    { model: db.modules.bussines.Invoice, as: 'invoice', required: false }
  ];

  return Notification.findAndCountAll({
    where,
    offset,
    limit,
    order,
    include: include || defaultInclude,
    distinct: true,
  });
};

const create = async (payload) => {
  return Notification.create(payload);
};

const update = async (notification, payload) => {
  return notification.update(payload);
};

const save = async (notification) => {
  return notification.save();
};

const findPendingRetries = async (limit = 10) => {
  return Notification.findAll({
    where: {
      status: 'error',
      attempts: { [Op.lt]: 5 },
      nextAttempt: { [Op.lte]: new Date() }
    },
    order: [['nextAttempt', 'ASC']],
    limit
  });
};

const findByPeopleId = async (peopleId, limit = 50) => {
  return Notification.findAll({
    where: { peopleId },
    order: [['createdAt', 'DESC']],
    limit,
    include: [
      { model: db.modules.operative.Appointment, as: 'appointment', required: false },
      { model: db.modules.clinic.Result, as: 'result', required: false },
      { model: db.modules.bussines.Invoice, as: 'invoice', required: false }
    ]
  });
};

const findByAppointmentId = async (appointmentId) => {
  return Notification.findAll({
    where: { appointmentId },
    order: [['createdAt', 'DESC']]
  });
};

const countByStatus = async (status, filters = {}) => {
  const where = { status };
  
  if (filters.startDate) {
    where.createdAt = { [Op.gte]: filters.startDate };
  }
  if (filters.endDate) {
    where.createdAt = { ...where.createdAt, [Op.lte]: filters.endDate };
  }
  if (filters.type) {
    where.type = filters.type;
  }

  return Notification.count({ where });
};

const getStatistics = async (filters = {}) => {
  const where = {};
  
  if (filters.startDate) {
    where.createdAt = { [Op.gte]: filters.startDate };
  }
  if (filters.endDate) {
    where.createdAt = { ...where.createdAt, [Op.lte]: filters.endDate };
  }
  if (filters.type) {
    where.type = filters.type;
  }

  const [total, sent, pending, error] = await Promise.all([
    Notification.count({ where }),
    Notification.count({ where: { ...where, status: 'enviado' } }),
    Notification.count({ where: { ...where, status: 'pendiente' } }),
    Notification.count({ where: { ...where, status: 'error' } })
  ]);

  return {
    total,
    sent,
    pending,
    error,
    successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : 0
  };
};

const deleteOldNotifications = async (daysOld = 90) => {
  const date = new Date();
  date.setDate(date.getDate() - daysOld);
  
  return Notification.destroy({
    where: {
      createdAt: { [Op.lt]: date },
      status: 'enviado'
    }
  });
};

module.exports = {
  findById,
  findAndCountAll,
  create,
  update,
  save,
  findPendingRetries,
  findByPeopleId,
  findByAppointmentId,
  countByStatus,
  getStatistics,
  deleteOldNotifications
};

