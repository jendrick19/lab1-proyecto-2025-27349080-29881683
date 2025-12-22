const { Op } = require('sequelize');
const affiliationRepository = require('../repositories/AffiliationRepository');
const { buildPaginationParams, buildPaginationResponse } = require('../../../shared/utils/paginationHelper');
const { addDateRangeToWhere } = require('../../../shared/utils/dateRangeHelper');
const { NotFoundError, BusinessLogicError, ConflictError } = require('../../../shared/errors/CustomErrors');
const db = require('../../../../database/models');

const SORT_FIELDS = {
  numeroPoliza: 'policyNumber',
  vigenteDesde: 'effectiveFrom',
  vigenteHasta: 'effectiveTo',
  createdAt: 'createdAt',
};

const buildWhere = ({ personaId, planId, numeroPoliza, vigenteDesde, vigenteHasta, estado }) => {
  const where = {};
  if (personaId) {
    where.peopleId = Number(personaId);
  }
  if (planId) {
    where.planId = Number(planId);
  }
  if (numeroPoliza) {
    where.policyNumber = {
      [Op.like]: `%${numeroPoliza}%`,
    };
  }
  if (estado !== undefined) {
    if (typeof estado === 'string') {
      where.status = ['true', '1', 'activo', 'active'].includes(estado.toLowerCase());
    } else {
      where.status = Boolean(estado);
    }
  } else {
    where.status = true;
  }
  addDateRangeToWhere(where, 'effectiveFrom', vigenteDesde, vigenteHasta);
  return where;
};

const listAffiliations = async ({
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
  const { count, rows } = await affiliationRepository.findAndCountAll({
    where,
    offset,
    limit: safeLimit,
    order: [[orderField, orderDirection]],
  });
  return buildPaginationResponse(rows, count, safePage, safeLimit);
};

const getAffiliationById = async (id, includeInactive = false) => {
  const affiliation = await affiliationRepository.findById(id);
  if (!affiliation) {
    throw new NotFoundError('Afiliación no encontrada');
  }
  if (!includeInactive && !affiliation.status) {
    throw new NotFoundError('Afiliación no encontrada');
  }
  return affiliation;
};

const createAffiliation = async (payload) => {
  const person = await db.modules.operative.PeopleAttended.findByPk(payload.peopleId);
  if (!person) {
    throw new NotFoundError('La persona especificada no existe');
  }
  if (!person.status) {
    throw new BusinessLogicError('La persona especificada está inactiva');
  }

  const plan = await db.modules.bussines.Plan.findByPk(payload.planId);
  if (!plan) {
    throw new NotFoundError('El plan especificado no existe');
  }
  if (!plan.activo) {
    throw new BusinessLogicError('El plan especificado está inactivo');
  }

  if (payload.status === undefined) {
    payload.status = true;
  }

  // Validar que no exista otra afiliación activa para la misma persona y plan
  if (payload.status === true) {
    const existingActiveAffiliation = await db.modules.bussines.Affiliation.findOne({
      where: {
        peopleId: payload.peopleId,
        planId: payload.planId,
        status: true,
      },
    });

    if (existingActiveAffiliation) {
      throw new ConflictError('La persona ya tiene una afiliación activa para este plan');
    }
  }

  return affiliationRepository.create(payload);
};

const updateAffiliation = async (id, payload) => {
  const affiliation = await getAffiliationById(id, true); // Include inactive to allow updating status
  
  if (payload.peopleId !== undefined && payload.peopleId !== affiliation.peopleId) {
    const person = await db.modules.operative.PeopleAttended.findByPk(payload.peopleId);
    if (!person) {
      throw new NotFoundError('La nueva persona especificada no existe');
    }
    if (!person.status) {
      throw new BusinessLogicError('La nueva persona especificada está inactiva');
    }
  }

  if (payload.planId !== undefined && payload.planId !== affiliation.planId) {
    const plan = await db.modules.bussines.Plan.findByPk(payload.planId);
    if (!plan) {
      throw new NotFoundError('El nuevo plan especificado no existe');
    }
    if (!plan.activo) {
      throw new BusinessLogicError('El nuevo plan especificado está inactivo');
    }
  }

  // Validar que al activar o cambiar persona/plan no se cree duplicado activo
  const finalPeopleId = payload.peopleId !== undefined ? payload.peopleId : affiliation.peopleId;
  const finalPlanId = payload.planId !== undefined ? payload.planId : affiliation.planId;
  const finalStatus = payload.status !== undefined ? payload.status : affiliation.status;

  if (finalStatus === true) {
    const existingActiveAffiliation = await db.modules.bussines.Affiliation.findOne({
      where: {
        peopleId: finalPeopleId,
        planId: finalPlanId,
        status: true,
        id: { [Op.ne]: id }, // Excluir la afiliación actual
      },
    });

    if (existingActiveAffiliation) {
      throw new ConflictError('La persona ya tiene una afiliación activa para este plan');
    }
  }

  return affiliationRepository.update(affiliation, payload);
};

const softDeleteAffiliation = async (id) => {
  const affiliation = await getAffiliationById(id);
  affiliation.status = false;
  return affiliationRepository.save(affiliation);
};

module.exports = {
  listAffiliations,
  getAffiliationById,
  createAffiliation,
  updateAffiliation,
  softDeleteAffiliation,
};

