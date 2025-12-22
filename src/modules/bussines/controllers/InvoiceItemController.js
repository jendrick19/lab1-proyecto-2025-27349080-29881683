const {
  listItems,
  getItemsByInvoiceId,
  getItemById,
  createItem,
  updateItem,
  removeItem,
} = require('../services/InvoiceItemService');

const mapModelToResponse = (item) => {
  if (!item) {
    return null;
  }
  return {
    id: item.id,
    facturaId: item.invoiceId,
    prestacionCodigo: item.serviceCode,
    descripcion: item.description,
    cantidad: item.quantity,
    valorUnitario: item.unitValue,
    impuestos: item.taxes,
    total: item.total,
    prestacion: item.service ? {
      codigo: item.service.code,
      nombre: item.service.name,
      grupo: item.service.group,
    } : undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const mapRequestToCreate = (body) => {
  return {
    serviceCode: body.prestacionCodigo,
    description: body.descripcion,
    quantity: body.cantidad,
    unitValue: body.valorUnitario,
    taxes: body.impuestos || 0,
  };
};

const mapRequestToUpdate = (body) => {
  const payload = {};
  if (body.prestacionCodigo !== undefined) payload.serviceCode = body.prestacionCodigo;
  if (body.descripcion !== undefined) payload.description = body.descripcion;
  if (body.cantidad !== undefined) payload.quantity = body.cantidad;
  if (body.valorUnitario !== undefined) payload.unitValue = body.valorUnitario;
  if (body.impuestos !== undefined) payload.taxes = body.impuestos;
  return payload;
};

const listHandler = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'asc',
      facturaId,
      prestacionCodigo,
    } = req.query;
    const result = await listItems({
      page,
      limit,
      sortBy,
      sortOrder,
      filters: {
        facturaId,
        prestacionCodigo,
      },
    });
    res.json({
      codigo: 200,
      mensaje: 'Lista de items de factura obtenida exitosamente',
      data: result.rows.map(mapModelToResponse),
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const listByInvoiceHandler = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const items = await getItemsByInvoiceId(invoiceId);
    return res.json({
      codigo: 200,
      mensaje: 'Items de factura obtenidos exitosamente',
      data: items.map(mapModelToResponse),
    });
  } catch (error) {
    return next(error);
  }
};

const getHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await getItemById(id);
    return res.json({
      codigo: 200,
      mensaje: 'Item de factura encontrado',
      data: mapModelToResponse(item),
    });
  } catch (error) {
    return next(error);
  }
};

const createHandler = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const payload = mapRequestToCreate(req.body);
    const item = await createItem(invoiceId, payload);
    return res.status(201).json({
      codigo: 201,
      mensaje: 'Item de factura creado exitosamente',
      data: mapModelToResponse(item),
    });
  } catch (error) {
    return next(error);
  }
};

const updateHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = mapRequestToUpdate(req.body);
    const updated = await updateItem(id, payload);
    return res.json({
      codigo: 200,
      mensaje: 'Item de factura actualizado exitosamente',
      data: mapModelToResponse(updated),
    });
  } catch (error) {
    return next(error);
  }
};

const removeHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    await removeItem(id);
    return res.json({
      codigo: 200,
      mensaje: 'Item de factura eliminado exitosamente',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listHandler,
  listByInvoiceHandler,
  getHandler,
  createHandler,
  updateHandler,
  removeHandler,
};

