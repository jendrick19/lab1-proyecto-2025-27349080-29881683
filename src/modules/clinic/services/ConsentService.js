const { Op } = require('sequelize');
const consentRepository = require('../repositories/ConsentRepository');
const { buildPaginationParams, buildPaginationResponse } = require('../../../shared/utils/pagination.helper');
const { NotFoundError, BusinessLogicError } = require('../../../shared/errors/CustomErrors');
const db = require('../../../../database/models');

const VALID_METHODS = ['Firma digital', 'Aceptación verbal con registro'];

const SORT_FIELDS = {
  fecha: 'consentDate',
  persona: 'peopleId',
  procedimiento: 'procedureType',
  metodo: 'method',
  createdAt: 'createdAt',
};

const validateConsentMethod = (method) => {
  if (!method) {
    throw new BusinessLogicError('El método de consentimiento es requerido');
  }

  if (!VALID_METHODS.includes(method)) {
    throw new BusinessLogicError(
      `Método de consentimiento "${method}" no es válido. Métodos válidos: ${VALID_METHODS.join(', ')}`
    );
  }

  return true;
};

const validatePeopleExists = async (peopleId) => {
  const people = await db.modules.operative.PeopleAttended.findByPk(peopleId);

  if (!people) {
    throw new NotFoundError('Persona no encontrada');
  }

  return people;
};

const buildWhere = ({ persona, procedimiento, metodo, fechaDesde, fechaHasta }) => {
  const where = {};

  if (persona) {
    where.peopleId = Number(persona);
  }

  if (procedimiento) {
    where.procedureType = {
      [Op.like]: `%${procedimiento}%`
    };
  }

  if (metodo) {
    where.method = metodo;
  }

  if (fechaDesde || fechaHasta) {
    where.consentDate = {};
    if (fechaDesde) {
      where.consentDate[Op.gte] = new Date(fechaDesde);
    }
    if (fechaHasta) {
      where.consentDate[Op.lte] = new Date(fechaHasta);
    }
  }

  return where;
};

const listConsents = async ({
  page,
  limit,
  filters,
  sortBy,
  sortOrder,
}) => {
  const { safePage, safeLimit, offset } = buildPaginationParams(page, limit);

  const orderField = SORT_FIELDS[sortBy] || SORT_FIELDS.fecha;
  const orderDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const where = buildWhere(filters || {});

  const { count, rows } = await consentRepository.findAndCountAll({
    where,
    offset,
    limit: safeLimit,
    order: [[orderField, orderDirection]],
  });

  return buildPaginationResponse(rows, count, safePage, safeLimit);
};

const getConsentById = async (id) => {
  const consent = await consentRepository.findById(id);

  if (!consent) {
    throw new NotFoundError('Consentimiento no encontrado');
  }

  return consent;
};

const getConsentsByPeopleDocument = async (documentId, { page, limit, sortBy, sortOrder }) => {
  if (!documentId) {
    throw new BusinessLogicError('El documento de la persona es requerido');
  }

  const { safePage, safeLimit, offset } = buildPaginationParams(page, limit);

  const orderField = SORT_FIELDS[sortBy] || SORT_FIELDS.fecha;
  const orderDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const { count, rows } = await consentRepository.findByPeopleDocument(documentId, {
    offset,
    limit: safeLimit,
    order: [[orderField, orderDirection]]
  });

  return buildPaginationResponse(rows, count, safePage, safeLimit);
};

const countConsentsByPeopleDocument = async (documentId) => {
  if (!documentId) {
    throw new BusinessLogicError('El documento de la persona es requerido');
  }

  return consentRepository.countByPeopleDocument(documentId);
};

const createConsent = async (consentData) => {
  if (!consentData.peopleId) {
    throw new BusinessLogicError('El ID de la persona es requerido');
  }

  if (!consentData.procedureType) {
    throw new BusinessLogicError('El tipo de procedimiento es requerido');
  }

  // Validar que la persona existe
  await validatePeopleExists(consentData.peopleId);

  // Validar método
  validateConsentMethod(consentData.method);

  // Si no se proporciona fecha, usar la fecha actual
  if (!consentData.consentDate) {
    consentData.consentDate = new Date();
  }

  return consentRepository.create(consentData);
};

const updateConsent = async (id, payload) => {
  const consent = await getConsentById(id);

  if (payload.peopleId !== undefined && payload.peopleId !== consent.peopleId) {
    throw new BusinessLogicError('No se puede cambiar la persona de un consentimiento existente');
  }

  if (payload.method !== undefined && payload.method !== consent.method) {
    validateConsentMethod(payload.method);
  }

  return consentRepository.update(consent, payload);
};

const deleteConsent = async (id) => {
  const consent = await getConsentById(id);

  return consentRepository.remove(consent);
};

module.exports = {
  listConsents,
  getConsentById,
  getConsentsByPeopleDocument,
  countConsentsByPeopleDocument,
  createConsent,
  updateConsent,
  deleteConsent,
  validateConsentMethod,
  validatePeopleExists,
};

