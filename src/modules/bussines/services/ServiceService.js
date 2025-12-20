const { Op } = require('sequelize');
const serviceRepository = require('../repositories/ServiceRepository');
const { buildPaginationParams, buildPaginationResponse } = require('../../../shared/utils/paginationHelper');
const { NotFoundError, BusinessLogicError } = require('../../../shared/errors/CustomErrors');
const db = require('../../../../database/models');

const SORT_FIELDS = {
  codigo: 'code',
  nombre: 'name',
  grupo: 'group',
  createdAt: 'createdAt',
};

const buildWhere = ({ codigo, nombre, grupo, requiereAutorizacion }) => {
  const where = {};
  if (codigo) {
    where.code = {
      [Op.like]: `%${codigo}%`,
    };
  }
  if (nombre) {
    where.name = {
      [Op.like]: `%${nombre}%`,
    };
  }
  if (grupo) {
    where.group = {
      [Op.like]: `%${grupo}%`,
    };
  }
  if (requiereAutorizacion !== undefined) {
    if (typeof requiereAutorizacion === 'string') {
      where.requiresAuthorization = ['true', '1', 'si', 'yes'].includes(requiereAutorizacion.toLowerCase());
    } else {
      where.requiresAuthorization = Boolean(requiereAutorizacion);
    }
  }
  return where;
};

const listServices = async ({
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
  const { count, rows } = await serviceRepository.findAndCountAll({
    where,
    offset,
    limit: safeLimit,
    order: [[orderField, orderDirection]],
  });
  return buildPaginationResponse(rows, count, safePage, safeLimit);
};

const getServiceByCode = async (code) => {
  const service = await serviceRepository.findByCode(code);
  if (!service) {
    throw new NotFoundError('Prestación no encontrada');
  }
  return service;
};

const createService = async (payload) => {
  // Validar que el código no exista
  const existingService = await serviceRepository.findByCode(payload.code);
  if (existingService) {
    throw new BusinessLogicError('Ya existe una prestación con este código');
  }

  if (payload.requiresAuthorization === undefined) {
    payload.requiresAuthorization = false;
  }

  return serviceRepository.create(payload);
};

const updateService = async (code, payload) => {
  const service = await getServiceByCode(code);

  // No permitir cambiar el código
  if (payload.code !== undefined && payload.code !== code) {
    throw new BusinessLogicError('No se puede cambiar el código de la prestación');
  }

  return serviceRepository.update(service, payload);
};

// Validar si una prestación requiere autorización y si tiene una autorización aprobada
const validateAuthorizationRequired = async (serviceCode, planId, orderId = null) => {
  const service = await getServiceByCode(serviceCode);

  if (!service.requiresAuthorization) {
    return true; // No requiere autorización
  }

  // Buscar autorización aprobada para este plan y orden si se proporciona
  const where = {
    planId,
    status: 'aprobada',
  };

  if (orderId) {
    where.orderId = orderId;
  }

  const authorization = await db.modules.bussines.Authorization.findOne({ where });

  if (!authorization) {
    throw new BusinessLogicError('Esta prestación requiere autorización aprobada');
  }

  return true;
};

module.exports = {
  listServices,
  getServiceByCode,
  createService,
  updateService,
  validateAuthorizationRequired,
};

