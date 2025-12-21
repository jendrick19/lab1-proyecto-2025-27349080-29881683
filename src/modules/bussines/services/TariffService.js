const { Op } = require('sequelize');
const tariffRepository = require('../repositories/TariffRepository');
const { buildPaginationParams, buildPaginationResponse } = require('../../../shared/utils/paginationHelper');
const { addDateRangeToWhere } = require('../../../shared/utils/dateRangeHelper');
const { NotFoundError, BusinessLogicError } = require('../../../shared/errors/CustomErrors');
const db = require('../../../../database/models');

const SORT_FIELDS = {
  valorBase: 'baseValue',
  vigenciaDesde: 'effectiveFrom',
  vigenciaHasta: 'effectiveTo',
  createdAt: 'createdAt',
};

const buildWhere = ({ prestacionCodigo, planId, vigenciaDesde, vigenciaHasta }) => {
  const where = {};
  if (prestacionCodigo) {
    where.serviceCode = {
      [Op.like]: `%${prestacionCodigo}%`,
    };
  }
  if (planId !== undefined) {
    if (planId === null || planId === 'null' || planId === 'general') {
      // Buscar tarifas generales (planId = null)
      where.planId = null;
    } else {
      where.planId = Number(planId);
    }
  }
  addDateRangeToWhere(where, 'effectiveFrom', vigenciaDesde, vigenciaHasta);
  addDateRangeToWhere(where, 'effectiveTo', vigenciaDesde, vigenciaHasta);
  return where;
};

const listTariffs = async ({
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
  const { count, rows } = await tariffRepository.findAndCountAll({
    where,
    offset,
    limit: safeLimit,
    order: [[orderField, orderDirection]],
  });
  return buildPaginationResponse(rows, count, safePage, safeLimit);
};

const getTariffById = async (id) => {
  const tariff = await tariffRepository.findById(id);
  if (!tariff) {
    throw new NotFoundError('Arancel no encontrado');
  }
  return tariff;
};

// Obtener tarifa activa para una prestación y plan
// Si no hay tarifa específica del plan, retorna la tarifa general
const getActiveTariff = async (serviceCode, planId = null) => {
  const service = await db.modules.bussines.Service.findByPk(serviceCode);
  if (!service) {
    throw new NotFoundError('La prestación especificada no existe');
  }

  if (planId) {
    const plan = await db.modules.bussines.Plan.findByPk(planId);
    if (!plan) {
      throw new NotFoundError('El plan especificado no existe');
    }
    if (!plan.activo) {
      throw new BusinessLogicError('El plan especificado está inactivo');
    }
  }

  const tariff = await tariffRepository.findActiveTariff(serviceCode, planId);
  if (!tariff) {
    throw new NotFoundError('No se encontró una tarifa activa para esta prestación');
  }
  return tariff;
};

const createTariff = async (payload) => {
  const service = await db.modules.bussines.Service.findByPk(payload.serviceCode);
  if (!service) {
    throw new NotFoundError('La prestación especificada no existe');
  }

  if (payload.planId !== null && payload.planId !== undefined) {
    const plan = await db.modules.bussines.Plan.findByPk(payload.planId);
    if (!plan) {
      throw new NotFoundError('El plan especificado no existe');
    }
    if (!plan.activo) {
      throw new BusinessLogicError('El plan especificado está inactivo');
    }
  }

  // Validar que no haya solapamiento de fechas para la misma prestación y plan
  if (payload.effectiveFrom) {
    const where = {
      serviceCode: payload.serviceCode,
      planId: payload.planId !== undefined ? payload.planId : null,
      [Op.or]: [
        {
          effectiveFrom: { [Op.lte]: payload.effectiveFrom },
          effectiveTo: { [Op.gte]: payload.effectiveFrom }
        },
        {
          effectiveFrom: { [Op.lte]: payload.effectiveTo || new Date('2099-12-31') },
          effectiveTo: { [Op.gte]: payload.effectiveTo || new Date('2099-12-31') }
        },
        {
          effectiveFrom: { [Op.gte]: payload.effectiveFrom },
          effectiveTo: { [Op.lte]: payload.effectiveTo || new Date('2099-12-31') }
        }
      ]
    };
    
    if (payload.effectiveTo) {
      where[Op.or].push({
        effectiveFrom: { [Op.lte]: payload.effectiveTo },
        effectiveTo: { [Op.gte]: payload.effectiveTo }
      });
    }

    const overlappingTariff = await db.modules.bussines.Tariff.findOne({ where });
    if (overlappingTariff) {
      throw new BusinessLogicError('Ya existe una tarifa con fechas solapadas para esta prestación y plan');
    }
  }

  if (payload.baseValue === undefined) {
    payload.baseValue = 0;
  }
  if (payload.taxes === undefined) {
    payload.taxes = 0;
  }

  return tariffRepository.create(payload);
};

const updateTariff = async (id, payload) => {
  const tariff = await getTariffById(id);

  if (payload.serviceCode !== undefined && payload.serviceCode !== tariff.serviceCode) {
    const service = await db.modules.bussines.Service.findByPk(payload.serviceCode);
    if (!service) {
      throw new NotFoundError('La nueva prestación especificada no existe');
    }
  }

  if (payload.planId !== undefined) {
    const newPlanId = payload.planId === null || payload.planId === 'null' ? null : payload.planId;
    
    if (newPlanId !== null) {
      const plan = await db.modules.bussines.Plan.findByPk(newPlanId);
      if (!plan) {
        throw new NotFoundError('El nuevo plan especificado no existe');
      }
      if (!plan.activo) {
        throw new BusinessLogicError('El nuevo plan especificado está inactivo');
      }
    }
    
    payload.planId = newPlanId;
  }

  // Validar solapamiento de fechas si se cambian
  if (payload.effectiveFrom !== undefined || payload.effectiveTo !== undefined) {
    const effectiveFrom = payload.effectiveFrom !== undefined ? payload.effectiveFrom : tariff.effectiveFrom;
    const effectiveTo = payload.effectiveTo !== undefined ? payload.effectiveTo : tariff.effectiveTo;
    const serviceCode = payload.serviceCode !== undefined ? payload.serviceCode : tariff.serviceCode;
    const planId = payload.planId !== undefined ? payload.planId : tariff.planId;

    const where = {
      serviceCode,
      planId: planId !== undefined ? planId : null,
      id: { [Op.ne]: id },
      [Op.or]: [
        {
          effectiveFrom: { [Op.lte]: effectiveFrom },
          effectiveTo: { [Op.gte]: effectiveFrom }
        },
        {
          effectiveFrom: { [Op.lte]: effectiveTo || new Date('2099-12-31') },
          effectiveTo: { [Op.gte]: effectiveTo || new Date('2099-12-31') }
        },
        {
          effectiveFrom: { [Op.gte]: effectiveFrom },
          effectiveTo: { [Op.lte]: effectiveTo || new Date('2099-12-31') }
        }
      ]
    };

    if (effectiveTo) {
      where[Op.or].push({
        effectiveFrom: { [Op.lte]: effectiveTo },
        effectiveTo: { [Op.gte]: effectiveTo }
      });
    }

    const overlappingTariff = await db.modules.bussines.Tariff.findOne({ where });
    if (overlappingTariff) {
      throw new BusinessLogicError('Ya existe una tarifa con fechas solapadas para esta prestación y plan');
    }
  }

  return tariffRepository.update(tariff, payload);
};

module.exports = {
  listTariffs,
  getTariffById,
  getActiveTariff,
  createTariff,
  updateTariff,
};

