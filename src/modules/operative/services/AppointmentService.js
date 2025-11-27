const { Op } = require('sequelize');
const appointmentRepository = require('../repositories/AppointmentRepository');
const { buildPaginationParams, buildPaginationResponse } = require('../../../shared/utils/paginationHelper');
const { addDateRangeToWhere } = require('../../../shared/utils/dateRangeHelper');
const { NotFoundError, BusinessLogicError, ConflictError } = require('../../../shared/errors/CustomErrors');
const db = require('../../../../database/models');

const VALID_STATUSES = ['solicitada', 'confirmada', 'cumplida', 'cancelada', 'no asistio'];

const ALLOWED_TRANSITIONS = {
  'solicitada': ['confirmada', 'cancelada'],
  'confirmada': ['cumplida', 'cancelada', 'no asistio'],
  'cumplida': [],
  'cancelada': [],
  'no asistio': []
};

const SORT_FIELDS = {
  fecha: 'startTime',
  estado: 'status',
  paciente: 'peopleId',
  profesional: 'professionalId',
  createdAt: 'createdAt',
};

const buildWhere = ({ paciente, profesional, estado, fechaDesde, fechaHasta, agendaId, unidadId }) => {
  const where = {};

  if (paciente) {
    where.peopleId = Number(paciente);
  }

  if (profesional) {
    where.professionalId = Number(profesional);
  }

  if (agendaId) {
    where.scheduleId = Number(agendaId);
  }

  if (unidadId) {
    where.unitId = Number(unidadId);
  }

  if (estado) {
    // Normalizar estado a minúsculas (case-insensitive)
    const normalizeStatus = (status) => {
      if (typeof status === 'string') {
        return status.toLowerCase();
      }
      return status;
    };

    if (Array.isArray(estado)) {
      where.status = { [Op.in]: estado.map(normalizeStatus) };
    } else {
      where.status = normalizeStatus(estado);
    }
  }

  addDateRangeToWhere(where, 'startTime', fechaDesde, fechaHasta);

  return where;
};

const buildInclude = ({ nombrePersona, nombreProfesional }) => {
  const include = [
    { model: db.modules.operative.PeopleAttended, as: 'peopleAttended' },
    { model: db.modules.operative.Professional, as: 'professional' },
    { model: db.modules.operative.Schedule, as: 'schedule' },
    { model: db.modules.operative.CareUnit, as: 'careUnit' }
  ];

  if (nombrePersona) {
    include[0].where = {
      [Op.or]: [
        { names: { [Op.like]: `%${nombrePersona}%` } },
        { surNames: { [Op.like]: `%${nombrePersona}%` } },
      ]
    };
  }

  if (nombreProfesional) {
    include[1].where = {
      [Op.or]: [
        { names: { [Op.like]: `%${nombreProfesional}%` } },
        { surNames: { [Op.like]: `%${nombreProfesional}%` } },
      ]
    };
  }

  return include;
};

const listAppointments = async ({
  page,
  limit,
  filters,
  sortBy,
  sortOrder,
}) => {
  const { safePage, safeLimit, offset } = buildPaginationParams(page, limit);

  const { nombrePersona, nombreProfesional, ...rawFilters } = filters || {};

  const orderField = SORT_FIELDS[sortBy] || SORT_FIELDS.fecha;
  const orderDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const where = buildWhere(rawFilters);
  const include = buildInclude({ nombrePersona, nombreProfesional });

  const { count, rows } = await appointmentRepository.findAndCountAll({
    where,
    offset,
    limit: safeLimit,
    order: [[orderField, orderDirection]],
    include
  });

  return buildPaginationResponse(rows, count, safePage, safeLimit);
};

const getAppointmentById = async (id) => {
  const appointment = await appointmentRepository.findById(id);

  if (!appointment) {
    throw new NotFoundError('Cita no encontrada');
  }

  return appointment;
};

const checkScheduleOverlap = async (scheduleId, startTime, endTime, excludeAppointmentId = null) => {
  if (!scheduleId || !startTime || !endTime) {
    return false;
  }

  const overlappingAppointment = await appointmentRepository.findOverlapping(
    scheduleId,
    startTime,
    endTime,
    excludeAppointmentId
  );

  return overlappingAppointment !== null;
};

const normalizeStatus = (status) => {
  if (typeof status === 'string') {
    return status.toLowerCase();
  }
  return status;
};

const validateStatusTransition = (oldStatus, newStatus) => {
  const normalizedNewStatus = normalizeStatus(newStatus);
  const normalizedOldStatus = normalizeStatus(oldStatus);

  if (!VALID_STATUSES.includes(normalizedNewStatus)) {
    throw new BusinessLogicError(`Estado "${newStatus}" no es válido. Estados válidos: ${VALID_STATUSES.join(', ')}`);
  }

  if (normalizedOldStatus === normalizedNewStatus) {
    return true;
  }

  const allowedNextStatuses = ALLOWED_TRANSITIONS[normalizedOldStatus] || [];
  
  if (!allowedNextStatuses.includes(normalizedNewStatus)) {
    throw new BusinessLogicError(
      `No se puede cambiar de "${oldStatus}" a "${newStatus}". ` +
      `Estados permitidos: ${allowedNextStatuses.join(', ') || 'ninguno (estado final)'}`
    );
  }

  return true;
};

const recordHistory = async (appointment, changes, changeReason) => {
  if (!changeReason) {
    return null;
  }

  const historyData = {
    appointmentId: appointment.id,
    changeReason,
    changedAt: new Date()
  };

  let hasChanges = false;

  if (changes.status !== undefined && changes.status !== appointment.status) {
    historyData.oldStatus = appointment.status;
    historyData.newStatus = changes.status;
    hasChanges = true;
  }

  if (changes.startTime !== undefined && changes.startTime !== appointment.startTime) {
    historyData.oldStartTime = appointment.startTime;
    historyData.newStartTime = changes.startTime;
    hasChanges = true;
  }

  if (changes.endTime !== undefined && changes.endTime !== appointment.endTime) {
    historyData.oldEndTime = appointment.endTime;
    historyData.newEndTime = changes.endTime;
    hasChanges = true;
  }

  if (hasChanges) {
    return appointmentRepository.createHistory(historyData);
  }

  return null;
};

const createAppointment = async (appointmentData) => {
  // Normalizar estado a minúsculas
  if (appointmentData.status) {
    appointmentData.status = normalizeStatus(appointmentData.status);
  } else {
    appointmentData.status = 'solicitada';
  }

  if (appointmentData.scheduleId && appointmentData.startTime && appointmentData.endTime) {
    const hasOverlap = await checkScheduleOverlap(
      appointmentData.scheduleId,
      appointmentData.startTime,
      appointmentData.endTime
    );

    if (hasOverlap) {
      throw new ConflictError('La cita se solapa con otra cita existente en el mismo horario');
    }
  }

  return appointmentRepository.create(appointmentData);
};

const updateAppointment = async (appointment, payload, changeReason = null) => {
  const oldStatus = appointment.status;
  const oldStartTime = appointment.startTime;
  const oldEndTime = appointment.endTime;

  // Normalizar estado si se proporciona
  if (payload.status !== undefined) {
    payload.status = normalizeStatus(payload.status);
    if (payload.status !== appointment.status) {
      validateStatusTransition(appointment.status, payload.status);
    }
  }

  const scheduleId = payload.scheduleId !== undefined ? payload.scheduleId : appointment.scheduleId;
  const startTime = payload.startTime !== undefined ? payload.startTime : appointment.startTime;
  const endTime = payload.endTime !== undefined ? payload.endTime : appointment.endTime;

  const scheduleChanged = payload.scheduleId !== undefined && payload.scheduleId !== appointment.scheduleId;
  const timeChanged = (payload.startTime !== undefined && payload.startTime !== appointment.startTime) ||
                      (payload.endTime !== undefined && payload.endTime !== appointment.endTime);

  if ((scheduleChanged || timeChanged) && scheduleId && startTime && endTime) {
    const hasOverlap = await checkScheduleOverlap(
      scheduleId,
      startTime,
      endTime,
      appointment.id
    );

    if (hasOverlap) {
      throw new ConflictError('La cita se solapa con otra cita existente en el mismo horario');
    }
  }

  await appointmentRepository.update(appointment, payload);

  const historyChanges = {};
  if (payload.status !== undefined) {
    historyChanges.status = payload.status;
  }
  if (payload.startTime !== undefined) {
    historyChanges.startTime = payload.startTime;
  }
  if (payload.endTime !== undefined) {
    historyChanges.endTime = payload.endTime;
  }

  if (Object.keys(historyChanges).length > 0) {
    await recordHistory(
      { id: appointment.id, status: oldStatus, startTime: oldStartTime, endTime: oldEndTime },
      historyChanges,
      changeReason
    );
  }

  return appointment.reload();
};

const softDeleteAppointment = async (id) => {
  const appointment = await getAppointmentById(id);
  
  const normalizedStatus = normalizeStatus(appointment.status);
  if (normalizedStatus === 'confirmada' || normalizedStatus === 'solicitada') {
    appointment.status = 'cancelada';
    await appointmentRepository.save(appointment);
    
    await recordHistory(
      appointment,
      { status: 'cancelada' },
      'Cita eliminada automáticamente'
    );
  }

  return appointment;
};

  module.exports = {
    listAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    softDeleteAppointment,
    checkScheduleOverlap,
    validateStatusTransition,
    recordHistory,
    normalizeStatus
  };

