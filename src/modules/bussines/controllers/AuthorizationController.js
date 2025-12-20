const {
  listAuthorizations,
  getAuthorizationById,
  createAuthorization,
  updateAuthorization,
} = require('../services/AuthorizationService');

const mapModelToResponse = (authorization) => {
  if (!authorization) {
    return null;
  }
  return {
    id: authorization.id,
    ordenId: authorization.orderId,
    planId: authorization.planId,
    procedimientoCodigo: authorization.procedureCode,
    estado: authorization.status,
    fechaSolicitud: authorization.requestDate ? authorization.requestDate.toISOString() : null,
    fechaRespuesta: authorization.responseDate ? authorization.responseDate.toISOString() : null,
    numeroAutorizacion: authorization.authorizationNumber,
    observaciones: authorization.observations,
    orden: authorization.order ? {
      id: authorization.order.id,
      tipo: authorization.order.type,
      estado: authorization.order.status,
    } : undefined,
    plan: authorization.plan ? {
      id: authorization.plan.id,
      nombre: authorization.plan.nombre,
      codigo: authorization.plan.codigo,
    } : undefined,
    createdAt: authorization.createdAt,
    updatedAt: authorization.updatedAt,
  };
};

const mapRequestToCreate = (body) => {
  const payload = {
    orderId: body.ordenId,
    planId: body.planId,
    procedureCode: body.procedimientoCodigo,
    authorizationNumber: body.numeroAutorizacion,
    observations: body.observaciones,
  };
  if (body.estado !== undefined) {
    payload.status = body.estado;
  } else {
    payload.status = 'solicitada';
  }
  if (body.fechaSolicitud !== undefined) {
    const date = new Date(body.fechaSolicitud);
    if (!Number.isNaN(date.getTime())) {
      payload.requestDate = date;
    }
  }
  if (body.fechaRespuesta !== undefined) {
    const date = new Date(body.fechaRespuesta);
    if (!Number.isNaN(date.getTime())) {
      payload.responseDate = date;
    }
  }
  return payload;
};

const mapRequestToUpdate = (body) => {
  const payload = {};
  if (body.ordenId !== undefined) payload.orderId = body.ordenId;
  if (body.planId !== undefined) payload.planId = body.planId;
  if (body.procedimientoCodigo !== undefined) payload.procedureCode = body.procedimientoCodigo;
  if (body.estado !== undefined) payload.status = body.estado;
  if (body.fechaSolicitud !== undefined) {
    const date = new Date(body.fechaSolicitud);
    if (!Number.isNaN(date.getTime())) {
      payload.requestDate = date;
    }
  }
  if (body.fechaRespuesta !== undefined) {
    const date = new Date(body.fechaRespuesta);
    if (!Number.isNaN(date.getTime())) {
      payload.responseDate = date;
    }
  }
  if (body.numeroAutorizacion !== undefined) payload.authorizationNumber = body.numeroAutorizacion;
  if (body.observaciones !== undefined) payload.observations = body.observaciones;
  return payload;
};

const listHandler = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'asc',
      ordenId,
      planId,
      procedimientoCodigo,
      estado,
      fechaSolicitud,
      fechaRespuesta,
      numeroAutorizacion,
    } = req.query;
    const result = await listAuthorizations({
      page,
      limit,
      sortBy,
      sortOrder,
      filters: {
        ordenId,
        planId,
        procedimientoCodigo,
        estado,
        fechaSolicitud,
        fechaRespuesta,
        numeroAutorizacion,
      },
    });
    res.json({
      codigo: 200,
      mensaje: 'Lista de autorizaciones obtenida exitosamente',
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
    const authorization = await getAuthorizationById(id);
    return res.json({
      codigo: 200,
      mensaje: 'Autorización encontrada',
      data: mapModelToResponse(authorization),
    });
  } catch (error) {
    return next(error);
  }
};

const createHandler = async (req, res, next) => {
  try {
    const payload = mapRequestToCreate(req.body);
    const authorization = await createAuthorization(payload);
    return res.status(201).json({
      codigo: 201,
      mensaje: 'Autorización creada exitosamente',
      data: mapModelToResponse(authorization),
    });
  } catch (error) {
    return next(error);
  }
};

const updateHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = mapRequestToUpdate(req.body);
    const updated = await updateAuthorization(id, payload);
    return res.json({
      codigo: 200,
      mensaje: 'Autorización actualizada exitosamente',
      data: mapModelToResponse(updated),
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
};

