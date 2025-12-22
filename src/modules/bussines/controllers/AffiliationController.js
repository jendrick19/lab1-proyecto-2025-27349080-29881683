const {
  listAffiliations,
  getAffiliationById,
  createAffiliation,
  updateAffiliation,
  softDeleteAffiliation,
} = require('../services/AffiliationService');

const mapModelToResponse = (affiliation) => {
  if (!affiliation) {
    return null;
  }
  return {
    id: affiliation.id,
    personaId: affiliation.peopleId,
    planId: affiliation.planId,
    numeroPoliza: affiliation.policyNumber,
    vigenteDesde: affiliation.effectiveFrom ? affiliation.effectiveFrom.toISOString() : null,
    vigenteHasta: affiliation.effectiveTo ? affiliation.effectiveTo.toISOString() : null,
    copago: affiliation.copayment,
    cuotaModeradora: affiliation.moderationFee,
    estado: affiliation.status,
    persona: affiliation.peopleAttended ? {
      id: affiliation.peopleAttended.id,
      nombres: affiliation.peopleAttended.names,
      apellidos: affiliation.peopleAttended.surNames,
    } : undefined,
    plan: affiliation.plan ? {
      id: affiliation.plan.id,
      nombre: affiliation.plan.nombre,
      codigo: affiliation.plan.codigo,
    } : undefined,
    createdAt: affiliation.createdAt,
    updatedAt: affiliation.updatedAt,
  };
};

const mapRequestToCreate = (body) => {
  const payload = {
    peopleId: body.personaId,
    planId: body.planId,
    policyNumber: body.numeroPoliza,
    copayment: body.copago,
    moderationFee: body.cuotaModeradora,
  };
  if (body.estado !== undefined) {
    if (typeof body.estado === 'string') {
      payload.status = ['true', '1', 'activo', 'active'].includes(body.estado.toLowerCase());
    } else {
      payload.status = Boolean(body.estado);
    }
  } else {
    payload.status = true;
  }
  if (body.vigenteDesde !== undefined) {
    const date = new Date(body.vigenteDesde);
    if (!Number.isNaN(date.getTime())) {
      payload.effectiveFrom = date;
    }
  }
  if (body.vigenteHasta !== undefined) {
    const date = new Date(body.vigenteHasta);
    if (!Number.isNaN(date.getTime())) {
      payload.effectiveTo = date;
    }
  }
  return payload;
};

const mapRequestToUpdate = (body) => {
  const payload = {};
  if (body.personaId !== undefined) payload.peopleId = body.personaId;
  if (body.planId !== undefined) payload.planId = body.planId;
  if (body.numeroPoliza !== undefined) payload.policyNumber = body.numeroPoliza;
  if (body.vigenteDesde !== undefined) {
    const date = new Date(body.vigenteDesde);
    if (!Number.isNaN(date.getTime())) {
      payload.effectiveFrom = date;
    }
  }
  if (body.vigenteHasta !== undefined) {
    const date = new Date(body.vigenteHasta);
    if (!Number.isNaN(date.getTime())) {
      payload.effectiveTo = date;
    }
  }
  if (body.copago !== undefined) payload.copayment = body.copago;
  if (body.cuotaModeradora !== undefined) payload.moderationFee = body.cuotaModeradora;
  if (body.estado !== undefined) {
    if (typeof body.estado === 'string') {
      payload.status = ['true', '1', 'activo', 'active'].includes(body.estado.toLowerCase());
    } else {
      payload.status = Boolean(body.estado);
    }
  }
  return payload;
};

const listHandler = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'asc',
      personaId,
      planId,
      numeroPoliza,
      vigenteDesde,
      vigenteHasta,
      estado,
    } = req.query;
    const result = await listAffiliations({
      page,
      limit,
      sortBy,
      sortOrder,
      filters: {
        personaId,
        planId,
        numeroPoliza,
        vigenteDesde,
        vigenteHasta,
        estado,
      },
    });
    res.json({
      codigo: 200,
      mensaje: 'Lista de afiliaciones obtenida exitosamente',
      data: result.rows.map(mapModelToResponse),
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const affiliation = await getAffiliationById(id);
    return res.json({
      codigo: 200,
      mensaje: 'Afiliación encontrada',
      data: mapModelToResponse(affiliation),
    });
  } catch (error) {
    return next(error);
  }
};

const createHandler = async (req, res, next) => {
  try {
    const payload = mapRequestToCreate(req.body);
    const affiliation = await createAffiliation(payload);
    return res.status(201).json({
      codigo: 201,
      mensaje: 'Afiliación creada exitosamente',
      data: mapModelToResponse(affiliation),
    });
  } catch (error) {
    return next(error);
  }
};

const updateHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = mapRequestToUpdate(req.body);
    const updated = await updateAffiliation(id, payload);
    return res.json({
      codigo: 200,
      mensaje: 'Afiliación actualizada exitosamente',
      data: mapModelToResponse(updated),
    });
  } catch (error) {
    return next(error);
  }
};

const deleteHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    await softDeleteAffiliation(id);
    return res.status(200).json({
      codigo: 200,
      mensaje: 'Afiliación eliminada exitosamente',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler,
};

