const { Op } = require('sequelize');
const db = require('../../../../database/models');

const { Appointment, AppointmentHistory } = db.modules.operative;

const findById = async (id) => {
  return Appointment.findByPk(id);
};

const findAndCountAll = async ({ where, offset, limit, order, personaNombre, profesionalNombre }) => {
  const include = [
    { model: db.modules.operative.PeopleAttended, as: 'peopleAttended' },
    { model: db.modules.operative.Professional, as: 'professional' },
    { model: db.modules.operative.Schedule, as: 'schedule' },
    { model: db.modules.operative.CareUnit, as: 'careUnit' }
  ];

  // Filtro de nombre del paciente
  if (personaNombre) {
    include[0].where = {
      [Op.or]: [
        { names: { [Op.like]: `%${personaNombre}%` } },
        { surNames: { [Op.like]: `%${personaNombre}%` } },
      ]
    };
  }

  // Filtro de nombre del profesional
  if (profesionalNombre) {
    include[1].where = {
      [Op.or]: [
        { names: { [Op.like]: `%${profesionalNombre}%` } },
        { surNames: { [Op.like]: `%${profesionalNombre}%` } },
      ]
    };
  }

  return Appointment.findAndCountAll({
    where,
    offset,
    limit,
    order,
    include,
    distinct: true,
  });
};

const findOverlapping = async (scheduleId, startTime, endTime, excludeAppointmentId = null) => {
  const where = {
    scheduleId,
    status: {
      [Op.in]: ['Solicitada', 'Confirmada']
    },
    [Op.or]: [
      {
        startTime: { [Op.lte]: startTime },
        endTime: { [Op.gte]: startTime }
      },
      {
        startTime: { [Op.lte]: endTime },
        endTime: { [Op.gte]: endTime }
      },
      {
        startTime: { [Op.gte]: startTime },
        endTime: { [Op.lte]: endTime }
      }
    ]
  };

  if (excludeAppointmentId) {
    where.id = { [Op.ne]: excludeAppointmentId };
  }

  return Appointment.findOne({ where });
};

const create = async (payload) => {
  return Appointment.create(payload);
};

const update = async (appointment, payload) => {
  return appointment.update(payload);
};

const save = async (appointment) => {
  return appointment.save();
};

const createHistory = async (historyData) => {
  return AppointmentHistory.create(historyData);
};

module.exports = {
  findById,
  findAndCountAll,
  findOverlapping,
  create,
  update,
  save,
  createHistory
};

