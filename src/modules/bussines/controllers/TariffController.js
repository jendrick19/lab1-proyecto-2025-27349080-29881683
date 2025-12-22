const {
  listTariffs,
  getTariffById,
  getActiveTariff,
  createTariff,
  updateTariff,
} = require('../services/TariffService');

const mapModelToResponse = (tariff) => {
  if (!tariff) {
    return null;
  }
  return {
    id: tariff.id,
    prestacionCodigo: tariff.serviceCode,
    planId: tariff.planId,
    valorBase: tariff.baseValue,
    impuestos: tariff.taxes,
    vigenciaDesde: tariff.effectiveFrom ? tariff.effectiveFrom.toISOString() : null,
    vigenciaHasta: tariff.effectiveTo ? tariff.effectiveTo.toISOString() : null,
    prestacion: tariff.service ? {
      codigo: tariff.service.code,
      nombre: tariff.service.name,
      grupo: tariff.service.group,
    } : undefined,
    plan: tariff.plan ? {
      id: tariff.plan.id,
      nombre: tariff.plan.nombre,
      codigo: tariff.plan.codigo,
    } : null,
    createdAt: tariff.createdAt,
    updatedAt: tariff.updatedAt,
  };
};

const mapRequestToCreate = (body) => {
  const payload = {
    serviceCode: body.prestacionCodigo,
    baseValue: body.valorBase,
    taxes: body.impuestos,
  };
  
  // Manejar planId: puede ser null para tarifa general, o un número para tarifa específica
  if (body.planId === null || body.planId === 'null' || body.planId === 'general' || body.planId === undefined) {
    payload.planId = null; // Tarifa general
  } else {
    payload.planId = Number(body.planId);
  }
  
  if (body.vigenciaDesde !== undefined) {
    const date = new Date(body.vigenciaDesde);
    if (!Number.isNaN(date.getTime())) {
      payload.effectiveFrom = date;
    }
  }
  if (body.vigenciaHasta !== undefined) {
    const date = new Date(body.vigenciaHasta);
    if (!Number.isNaN(date.getTime())) {
      payload.effectiveTo = date;
    }
  }
  return payload;
};

const mapRequestToUpdate = (body) => {
  const payload = {};
  if (body.prestacionCodigo !== undefined) payload.serviceCode = body.prestacionCodigo;
  
  // Manejar planId: puede ser null para tarifa general
  if (body.planId !== undefined) {
    if (body.planId === null || body.planId === 'null' || body.planId === 'general') {
      payload.planId = null; // Tarifa general
    } else {
      payload.planId = Number(body.planId);
    }
  }
  
  if (body.valorBase !== undefined) payload.baseValue = body.valorBase;
  if (body.impuestos !== undefined) payload.taxes = body.impuestos;
  if (body.vigenciaDesde !== undefined) {
    const date = new Date(body.vigenciaDesde);
    if (!Number.isNaN(date.getTime())) {
      payload.effectiveFrom = date;
    }
  }
  if (body.vigenciaHasta !== undefined) {
    const date = new Date(body.vigenciaHasta);
    if (!Number.isNaN(date.getTime())) {
      payload.effectiveTo = date;
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
      prestacionCodigo,
      planId,
      vigenciaDesde,
      vigenciaHasta,
    } = req.query;
    const result = await listTariffs({
      page,
      limit,
      sortBy,
      sortOrder,
      filters: {
        prestacionCodigo,
        planId,
        vigenciaDesde,
        vigenciaHasta,
      },
    });
    res.json({
      codigo: 200,
      mensaje: 'Lista de aranceles obtenida exitosamente',
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
    const tariff = await getTariffById(id);
    return res.json({
      codigo: 200,
      mensaje: 'Arancel encontrado',
      data: mapModelToResponse(tariff),
    });
  } catch (error) {
    return next(error);
  }
};

// Endpoint especial para obtener tarifa activa
const getActiveHandler = async (req, res, next) => {
  try {
    const { prestacionCodigo } = req.params;
    const { planId } = req.query;
    
    const planIdValue = planId === 'null' || planId === 'general' || planId === undefined ? null : Number(planId);
    const tariff = await getActiveTariff(prestacionCodigo, planIdValue);
    
    return res.json({
      codigo: 200,
      mensaje: 'Tarifa activa encontrada',
      data: mapModelToResponse(tariff),
    });
  } catch (error) {
    return next(error);
  }
};

const createHandler = async (req, res, next) => {
  try {
    const payload = mapRequestToCreate(req.body);
    const tariff = await createTariff(payload);
    return res.status(201).json({
      codigo: 201,
      mensaje: 'Arancel creado exitosamente',
      data: mapModelToResponse(tariff),
    });
  } catch (error) {
    return next(error);
  }
};

const updateHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = mapRequestToUpdate(req.body);
    const updated = await updateTariff(id, payload);
    return res.json({
      codigo: 200,
      mensaje: 'Arancel actualizado exitosamente',
      data: mapModelToResponse(updated),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listHandler,
  getHandler,
  getActiveHandler,
  createHandler,
  updateHandler,
};

