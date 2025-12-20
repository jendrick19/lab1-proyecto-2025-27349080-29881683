const { Op } = require('sequelize');
const authorizationRepository = require('../repositories/AuthorizationRepository');
const { buildPaginationParams, buildPaginationResponse } = require('../../../shared/utils/paginationHelper');
const { addDateRangeToWhere } = require('../../../shared/utils/dateRangeHelper');
const { NotFoundError, BusinessLogicError } = require('../../../shared/errors/CustomErrors');
const db = require('../../../../database/models');

const SORT_FIELDS = {
  numeroAutorizacion: 'authorizationNumber',
  fechaSolicitud: 'requestDate',
  fechaRespuesta: 'responseDate',
  estado: 'status',
  createdAt: 'createdAt',
};

const buildWhere = ({ ordenId, planId, procedimientoCodigo, estado, fechaSolicitud, fechaRespuesta, numeroAutorizacion }) => {
  const where = {};
  if (ordenId) {
    where.orderId = Number(ordenId);
  }
  if (planId) {
    where.planId = Number(planId);
  }
  if (procedimientoCodigo) {
    where.procedureCode = {
      [Op.like]: `%${procedimientoCodigo}%`,
    };
  }
  if (estado) {
    where.status = estado;
  }
  if (numeroAutorizacion) {
    where.authorizationNumber = {
      [Op.like]: `%${numeroAutorizacion}%`,
    };
  }
  addDateRangeToWhere(where, 'requestDate', fechaSolicitud, fechaRespuesta);
  addDateRangeToWhere(where, 'responseDate', fechaSolicitud, fechaRespuesta);
  return where;
};

const listAuthorizations = async ({
  page,
  limit,
  filters,
  sortBy,
  sortOrder,
}) => {
  const { safePage, safeLimit, offset } = buildPaginationParams(page, limit);
  const orderField = SORT_FIELDS[sortBy] || SORT_FIELDS.createdAt;
  const orderDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';
  const where = buildWhere(filters);
  const { count, rows } = await authorizationRepository.findAndCountAll({
    where,
    offset,
    limit: safeLimit,
    order: [[orderField, orderDirection]],
  });
  return buildPaginationResponse(rows, count, safePage, safeLimit);
};

const getAuthorizationById = async (id) => {
  const authorization = await authorizationRepository.findById(id);
  if (!authorization) {
    throw new NotFoundError('Autorización no encontrada');
  }
  return authorization;
};

const createAuthorization = async (payload) => {
  const order = await db.modules.clinic.Order.findByPk(payload.orderId);
  if (!order) {
    throw new NotFoundError('La orden especificada no existe');
  }

  const plan = await db.modules.bussines.Plan.findByPk(payload.planId);
  if (!plan) {
    throw new NotFoundError('El plan especificado no existe');
  }
  if (!plan.activo) {
    throw new BusinessLogicError('El plan especificado está inactivo');
  }

  if (payload.status === undefined) {
    payload.status = 'solicitada';
  }

  return authorizationRepository.create(payload);
};

const updateAuthorization = async (id, payload) => {
  const authorization = await getAuthorizationById(id);

  if (payload.orderId !== undefined && payload.orderId !== authorization.orderId) {
    const order = await db.modules.clinic.Order.findByPk(payload.orderId);
    if (!order) {
      throw new NotFoundError('La nueva orden especificada no existe');
    }
  }

  if (payload.planId !== undefined && payload.planId !== authorization.planId) {
    const plan = await db.modules.bussines.Plan.findByPk(payload.planId);
    if (!plan) {
      throw new NotFoundError('El nuevo plan especificado no existe');
    }
    if (!plan.activo) {
      throw new BusinessLogicError('El nuevo plan especificado está inactivo');
    }
  }

  return authorizationRepository.update(authorization, payload);
};

module.exports = {
  listAuthorizations,
  getAuthorizationById,
  createAuthorization,
  updateAuthorization,
};

