const { Op } = require('sequelize');
const episodeRepository = require('../repositories/episode.repository');
const { buildPaginationParams, buildPaginationResponse } = require('../../../shared/utils/pagination.helper');
const { NotFoundError, BusinessLogicError, ConflictError } = require('../../../shared/errors/CustomErrors');
const db = require('../../../../database/models');

// Estados válidos y transiciones permitidas
const VALID_STATUSES = ['Abierto', 'Cerrado'];

const ALLOWED_TRANSITIONS = {
  'Abierto': ['Cerrado'],
  'Cerrado': []
};

const VALID_TYPES = ['Consulta', 'Procedimiento', 'Control', 'Urgencia'];

const SORT_FIELDS = {
  fecha: 'openingDate',
  estado: 'status',
  tipo: 'type',
  paciente: 'peopleId',
  createdAt: 'createdAt',
};

const buildWhere = ({ paciente, estado, tipo, fechaDesde, fechaHasta }) => {
  const where = {};

  if (paciente) {
    where.peopleId = Number(paciente);
  }

  if (estado) {
    if (Array.isArray(estado)) {
      where.status = { [Op.in]: estado };
    } else {
      where.status = estado;
    }
  }

  if (tipo) {
    if (Array.isArray(tipo)) {
      where.type = { [Op.in]: tipo };
    } else {
      where.type = tipo;
    }
  }

  if (fechaDesde || fechaHasta) {
    where.openingDate = {};
    if (fechaDesde) {
      where.openingDate[Op.gte] = new Date(fechaDesde);
    }
    if (fechaHasta) {
      where.openingDate[Op.lte] = new Date(fechaHasta);
    }
  }

  return where;
};

const buildInclude = ({ nombrePaciente, documentoPaciente }) => {
  const include = [
    { model: db.modules.operative.PeopleAttended, as: 'peopleAttended' },
    { model: db.modules.clinic.ClinicalNote, as: 'clinicalNotes' },
    { model: db.modules.clinic.Diagnosis, as: 'diagnosis' }
  ];

  if (nombrePaciente) {
    include[0].where = {
      [Op.or]: [
        { names: { [Op.like]: `%${nombrePaciente}%` } },
        { surNames: { [Op.like]: `%${nombrePaciente}%` } },
      ]
    };
  }

  if (documentoPaciente) {
    include[0].where = include[0].where || {};
    include[0].where.documentId = {
      [Op.like]: `%${documentoPaciente}%`
    };
  }

  return include;
};

const listEpisodes = async ({
  page,
  limit,
  filters,
  sortBy,
  sortOrder,
}) => {
  const { safePage, safeLimit, offset } = buildPaginationParams(page, limit);

  // Extraer los filtros de nombre y documento
  const { nombrePaciente, documentoPaciente, ...rawFilters } = filters || {};

  const orderField = SORT_FIELDS[sortBy] || SORT_FIELDS.fecha;
  const orderDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const where = buildWhere(rawFilters);
  const include = buildInclude({ nombrePaciente, documentoPaciente });

  const { count, rows } = await episodeRepository.findAndCountAll({
    where,
    offset,
    limit: safeLimit,
    order: [[orderField, orderDirection]],
    include
  });

  return buildPaginationResponse(rows, count, safePage, safeLimit);
};

const getEpisodeById = async (id) => {
  const episode = await episodeRepository.findById(id);

  if (!episode) {
    throw new NotFoundError('Episodio no encontrado');
  }

  return episode;
};

const searchEpisodesByPatientName = async (searchTerm, { page, limit, sortBy, sortOrder }) => {
  const { safePage, safeLimit, offset } = buildPaginationParams(page, limit);

  const orderField = SORT_FIELDS[sortBy] || SORT_FIELDS.fecha;
  const orderDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const { count, rows } = await episodeRepository.findByPatientName(searchTerm, {
    offset,
    limit: safeLimit,
    order: [[orderField, orderDirection]]
  });

  return buildPaginationResponse(rows, count, safePage, safeLimit);
};

const searchEpisodesByPatientDocument = async (documentType, documentId, { page, limit, sortBy, sortOrder }) => {
  const { safePage, safeLimit, offset } = buildPaginationParams(page, limit);

  const orderField = SORT_FIELDS[sortBy] || SORT_FIELDS.fecha;
  const orderDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const { count, rows } = await episodeRepository.findByPatientDocument(documentType, documentId, {
    offset,
    limit: safeLimit,
    order: [[orderField, orderDirection]]
  });

  return buildPaginationResponse(rows, count, safePage, safeLimit);
};

// Validar transición de estados
const validateStatusTransition = (oldStatus, newStatus) => {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new BusinessLogicError(`Estado "${newStatus}" no es válido. Estados válidos: ${VALID_STATUSES.join(', ')}`);
  }

  if (oldStatus === newStatus) {
    return true;
  }

  const allowedNextStatuses = ALLOWED_TRANSITIONS[oldStatus] || [];
  
  if (!allowedNextStatuses.includes(newStatus)) {
    throw new BusinessLogicError(
      `No se puede cambiar de "${oldStatus}" a "${newStatus}". ` +
      `Estados permitidos: ${allowedNextStatuses.join(', ') || 'ninguno (estado final)'}`
    );
  }

  return true;
};

// Validar tipo de episodio
const validateEpisodeType = (type) => {
  if (!VALID_TYPES.includes(type)) {
    throw new BusinessLogicError(`Tipo "${type}" no es válido. Tipos válidos: ${VALID_TYPES.join(', ')}`);
  }
  return true;
};

const createEpisode = async (episodeData) => {
  // Validar que el paciente ID sea obligatorio
  if (!episodeData.peopleId) {
    throw new BusinessLogicError('El ID del paciente es requerido');
  }

  // Validar que el paciente existe y está activo
  const peopleAttended = await db.modules.operative.PeopleAttended.findByPk(episodeData.peopleId);
  if (!peopleAttended) {
    throw new NotFoundError('Paciente no encontrado');
  }
  if (!peopleAttended.status) {
    throw new BusinessLogicError('El paciente está inactivo');
  }

  // Validar que el tipo sea obligatorio
  if (!episodeData.type) {
    throw new BusinessLogicError('El tipo de episodio es requerido');
  }
  validateEpisodeType(episodeData.type);

  // Estado por defecto (obligatorio según migración)
  if (!episodeData.status) {
    episodeData.status = 'Abierto';
  }

  // Validar que el estado inicial sea válido
  if (!VALID_STATUSES.includes(episodeData.status)) {
    throw new BusinessLogicError(`Estado "${episodeData.status}" no es válido. Estados válidos: ${VALID_STATUSES.join(', ')}`);
  }

  // Fecha de apertura por defecto
  if (!episodeData.openingDate) {
    episodeData.openingDate = new Date();
  }

  return episodeRepository.create(episodeData);
};

const updateEpisode = async (id, payload) => {
  const episode = await getEpisodeById(id);

  // Validar transición de estado si se cambia
  if (payload.status !== undefined && payload.status !== episode.status) {
    validateStatusTransition(episode.status, payload.status);
  }

  // Validar tipo de episodio si se cambia
  if (payload.type !== undefined && payload.type !== episode.type) {
    validateEpisodeType(payload.type);
  }

  // No permitir cambiar el paciente una vez creado el episodio
  if (payload.peopleId !== undefined && payload.peopleId !== episode.peopleId) {
    throw new BusinessLogicError('No se puede cambiar el paciente de un episodio existente');
  }

  // No permitir cambiar la fecha de apertura
  if (payload.openingDate !== undefined && payload.openingDate !== episode.openingDate) {
    throw new BusinessLogicError('No se puede cambiar la fecha de apertura de un episodio');
  }

  return episodeRepository.update(episode, payload);
};

const closeEpisode = async (id) => {
  const episode = await getEpisodeById(id);

  if (episode.status === 'Cerrado') {
    throw new BusinessLogicError('El episodio ya está cerrado');
  }

  validateStatusTransition(episode.status, 'Cerrado');
  episode.status = 'Cerrado';
  
  return episodeRepository.save(episode);
};

module.exports = {
  listEpisodes,
  getEpisodeById,
  searchEpisodesByPatientName,
  searchEpisodesByPatientDocument,
  createEpisode,
  updateEpisode,
  closeEpisode,
  validateStatusTransition,
  validateEpisodeType
};

