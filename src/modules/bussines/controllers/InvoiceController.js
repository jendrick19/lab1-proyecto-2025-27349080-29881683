const {
  listInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  recalculateInvoiceTotals,
} = require('../services/InvoiceService');

const mapModelToResponse = (invoice) => {
  if (!invoice) {
    return null;
  }
  return {
    id: invoice.id,
    numero: invoice.number,
    fechaEmision: invoice.issueDate ? invoice.issueDate.toISOString() : null,
    personaId: invoice.peopleId,
    aseguradoraId: invoice.insurerId,
    moneda: invoice.currency,
    subTotal: invoice.subTotal,
    impuestos: invoice.taxes,
    total: invoice.total,
    estado: invoice.status,
    persona: invoice.peopleAttended ? {
      id: invoice.peopleAttended.id,
      nombres: invoice.peopleAttended.names,
      apellidos: invoice.peopleAttended.surNames,
      documento: invoice.peopleAttended.documentId,
    } : undefined,
    aseguradora: invoice.insurer ? {
      id: invoice.insurer.id,
      nombre: invoice.insurer.nombre,
      nit: invoice.insurer.nit,
    } : undefined,
    items: invoice.items ? invoice.items.map(item => ({
      id: item.id,
      prestacionCodigo: item.serviceCode,
      descripcion: item.description,
      cantidad: item.quantity,
      valorUnitario: item.unitValue,
      impuestos: item.taxes,
      total: item.total,
      prestacion: item.service ? {
        codigo: item.service.code,
        nombre: item.service.name,
      } : undefined,
    })) : undefined,
    pagos: invoice.payments ? invoice.payments.map(payment => ({
      id: payment.id,
      fecha: payment.date ? payment.date.toISOString() : null,
      monto: payment.amount,
      medio: payment.method,
      referencia: payment.reference,
      estado: payment.status,
    })) : undefined,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
  };
};

const mapRequestToCreate = (body) => {
  const payload = {
    number: body.numero,
    peopleId: body.personaId,
    insurerId: body.aseguradoraId,
    currency: body.moneda || 'VES',
    status: body.estado || 'emitida',
  };
  
  if (body.fechaEmision) {
    const date = new Date(body.fechaEmision);
    if (!Number.isNaN(date.getTime())) {
      payload.issueDate = date;
    }
  }
  
  if (body.subTotal !== undefined) payload.subTotal = body.subTotal;
  if (body.impuestos !== undefined) payload.taxes = body.impuestos;
  if (body.total !== undefined) payload.total = body.total;
  
  return payload;
};

const mapRequestToUpdate = (body) => {
  const payload = {};
  if (body.numero !== undefined) payload.number = body.numero;
  if (body.personaId !== undefined) payload.peopleId = body.personaId;
  if (body.aseguradoraId !== undefined) payload.insurerId = body.aseguradoraId;
  if (body.moneda !== undefined) payload.currency = body.moneda;
  if (body.estado !== undefined) payload.status = body.estado;
  if (body.subTotal !== undefined) payload.subTotal = body.subTotal;
  if (body.impuestos !== undefined) payload.taxes = body.impuestos;
  if (body.total !== undefined) payload.total = body.total;
  if (body.fechaEmision !== undefined) {
    const date = new Date(body.fechaEmision);
    if (!Number.isNaN(date.getTime())) {
      payload.issueDate = date;
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
      numero,
      personaId,
      aseguradoraId,
      estado,
      fechaEmisionDesde,
      fechaEmisionHasta,
      moneda,
    } = req.query;
    const result = await listInvoices({
      page,
      limit,
      sortBy,
      sortOrder,
      filters: {
        numero,
        personaId,
        aseguradoraId,
        estado,
        fechaEmisionDesde,
        fechaEmisionHasta,
        moneda,
      },
    });
    res.json({
      codigo: 200,
      mensaje: 'Lista de facturas obtenida exitosamente',
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
    const invoice = await getInvoiceById(id);
    return res.json({
      codigo: 200,
      mensaje: 'Factura encontrada',
      data: mapModelToResponse(invoice),
    });
  } catch (error) {
    return next(error);
  }
};

// Mapear items del formato español al formato inglés
const mapItemsFromRequest = (items) => {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  return items.map(item => ({
    serviceCode: item.prestacionCodigo,
    description: item.descripcion,
    quantity: item.cantidad,
    unitValue: item.valorUnitario,
    taxes: item.impuestos || 0,
    total: item.total
  }));
};

const createHandler = async (req, res, next) => {
  try {
    const payload = mapRequestToCreate(req.body);
    const items = mapItemsFromRequest(req.body.items || []);
    const invoice = await createInvoice(payload, items);
    return res.status(201).json({
      codigo: 201,
      mensaje: 'Factura creada exitosamente',
      data: mapModelToResponse(invoice),
    });
  } catch (error) {
    return next(error);
  }
};

const updateHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = mapRequestToUpdate(req.body);
    const updated = await updateInvoice(id, payload);
    return res.json({
      codigo: 200,
      mensaje: 'Factura actualizada exitosamente',
      data: mapModelToResponse(updated),
    });
  } catch (error) {
    return next(error);
  }
};

const recalculateHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await recalculateInvoiceTotals(id);
    return res.json({
      codigo: 200,
      mensaje: 'Totales de factura recalculados exitosamente',
      data: mapModelToResponse(invoice),
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
  recalculateHandler,
};

