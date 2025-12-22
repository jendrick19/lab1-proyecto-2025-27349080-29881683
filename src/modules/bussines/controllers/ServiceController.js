const {
  listServices,
  getServiceByCode,
  createService,
  updateService,
} = require('../services/ServiceService');

const mapModelToResponse = (service) => {
  if (!service) {
    return null;
  }
  return {
    codigo: service.code,
    nombre: service.name,
    grupo: service.group,
    requisitos: service.requirements,
    tiempoEstimado: service.estimatedTime,
    requiereAutorizacion: service.requiresAuthorization,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
};

const mapRequestToCreate = (body) => {
  const payload = {
    code: body.codigo,
    name: body.nombre,
    group: body.grupo,
    requirements: body.requisitos,
    estimatedTime: body.tiempoEstimado,
  };
  if (body.requiereAutorizacion !== undefined) {
    if (typeof body.requiereAutorizacion === 'string') {
      payload.requiresAuthorization = ['true', '1', 'si', 'yes'].includes(body.requiereAutorizacion.toLowerCase());
    } else {
      payload.requiresAuthorization = Boolean(body.requiereAutorizacion);
    }
  } else {
    payload.requiresAuthorization = false;
  }
  return payload;
};

const mapRequestToUpdate = (body) => {
  const payload = {};
  if (body.nombre !== undefined) payload.name = body.nombre;
  if (body.grupo !== undefined) payload.group = body.grupo;
  if (body.requisitos !== undefined) payload.requirements = body.requisitos;
  if (body.tiempoEstimado !== undefined) payload.estimatedTime = body.tiempoEstimado;
  if (body.requiereAutorizacion !== undefined) {
    if (typeof body.requiereAutorizacion === 'string') {
      payload.requiresAuthorization = ['true', '1', 'si', 'yes'].includes(body.requiereAutorizacion.toLowerCase());
    } else {
      payload.requiresAuthorization = Boolean(body.requiereAutorizacion);
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
      codigo,
      nombre,
      grupo,
      requiereAutorizacion,
    } = req.query;
    const result = await listServices({
      page,
      limit,
      sortBy,
      sortOrder,
      filters: {
        codigo,
        nombre,
        grupo,
        requiereAutorizacion,
      },
    });
    res.json({
      codigo: 200,
      mensaje: 'Lista de prestaciones obtenida exitosamente',
      data: result.rows.map(mapModelToResponse),
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getHandler = async (req, res, next) => {
  try {
    const { codigo } = req.params;
    const service = await getServiceByCode(codigo);
    return res.json({
      codigo: 200,
      mensaje: 'Prestación encontrada',
      data: mapModelToResponse(service),
    });
  } catch (error) {
    return next(error);
  }
};

const createHandler = async (req, res, next) => {
  try {
    const payload = mapRequestToCreate(req.body);
    const service = await createService(payload);
    return res.status(201).json({
      codigo: 201,
      mensaje: 'Prestación creada exitosamente',
      data: mapModelToResponse(service),
    });
  } catch (error) {
    return next(error);
  }
};

const updateHandler = async (req, res, next) => {
  try {
    const { codigo } = req.params;
    const payload = mapRequestToUpdate(req.body);
    const updated = await updateService(codigo, payload);
    return res.json({
      codigo: 200,
      mensaje: 'Prestación actualizada exitosamente',
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

