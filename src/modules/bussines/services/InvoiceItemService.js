const { Op } = require('sequelize');
const invoiceItemRepository = require('../repositories/InvoiceItemRepository');
const invoiceService = require('./InvoiceService');
const { buildPaginationParams, buildPaginationResponse } = require('../../../shared/utils/paginationHelper');
const { NotFoundError, BusinessLogicError } = require('../../../shared/errors/CustomErrors');
const db = require('../../../../database/models');

const SORT_FIELDS = {
  cantidad: 'quantity',
  valorUnitario: 'unitValue',
  total: 'total',
  createdAt: 'createdAt',
};

const buildWhere = ({ facturaId, prestacionCodigo }) => {
  const where = {};
  if (facturaId) {
    where.invoiceId = Number(facturaId);
  }
  if (prestacionCodigo) {
    where.serviceCode = { [Op.like]: `%${prestacionCodigo}%` };
  }
  return where;
};

const listItems = async ({
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
  const { count, rows } = await invoiceItemRepository.findAndCountAll({
    where,
    offset,
    limit: safeLimit,
    order: [[orderField, orderDirection]],
  });
  return buildPaginationResponse(rows, count, safePage, safeLimit);
};

const getItemsByInvoiceId = async (invoiceId) => {
  const invoice = await db.modules.bussines.Invoice.findByPk(invoiceId);
  if (!invoice) {
    throw new NotFoundError('Factura no encontrada');
  }
  return invoiceItemRepository.findByInvoiceId(invoiceId);
};

const getItemById = async (id) => {
  const item = await invoiceItemRepository.findById(id);
  if (!item) {
    throw new NotFoundError('Item de factura no encontrado');
  }
  return item;
};

const createItem = async (invoiceId, payload) => {
  const invoice = await db.modules.bussines.Invoice.findByPk(invoiceId);
  if (!invoice) {
    throw new NotFoundError('Factura no encontrada');
  }

  // No permitir agregar items a facturas anuladas o pagadas
  if (invoice.status === 'anulada' || invoice.status === 'pagada') {
    throw new BusinessLogicError(`No se pueden agregar items a una factura en estado '${invoice.status}'`);
  }

  // Validar que la prestación existe
  const service = await db.modules.bussines.Service.findByPk(payload.serviceCode);
  if (!service) {
    throw new NotFoundError('La prestación especificada no existe');
  }

  // Validar cantidad y precio
  if (!payload.quantity || payload.quantity <= 0) {
    throw new BusinessLogicError('La cantidad debe ser mayor a 0');
  }
  if (!payload.unitValue || payload.unitValue <= 0) {
    throw new BusinessLogicError('El precio unitario debe ser mayor a 0');
  }

  // Calcular total del item
  const itemSubTotal = payload.quantity * payload.unitValue;
  const itemTaxes = payload.taxes || 0;
  const itemTotal = itemSubTotal + itemTaxes;

  const item = await invoiceItemRepository.create({
    invoiceId,
    serviceCode: payload.serviceCode,
    description: payload.description,
    quantity: payload.quantity,
    unitValue: payload.unitValue,
    taxes: itemTaxes,
    total: itemTotal
  });

  // Recalcular totales de la factura
  await invoiceService.recalculateInvoiceTotals(invoiceId);

  return invoiceItemRepository.findById(item.id);
};

const updateItem = async (id, payload) => {
  const item = await invoiceItemRepository.findById(id);
  if (!item) {
    throw new NotFoundError('Item de factura no encontrado');
  }

  const invoice = await db.modules.bussines.Invoice.findByPk(item.invoiceId);
  if (!invoice) {
    throw new NotFoundError('Factura asociada no encontrada');
  }

  // No permitir modificar items de facturas anuladas o pagadas
  if (invoice.status === 'anulada' || invoice.status === 'pagada') {
    throw new BusinessLogicError(`No se pueden modificar items de una factura en estado '${invoice.status}'`);
  }

  // Validar prestación si se cambia
  if (payload.serviceCode && payload.serviceCode !== item.serviceCode) {
    const service = await db.modules.bussines.Service.findByPk(payload.serviceCode);
    if (!service) {
      throw new NotFoundError('La nueva prestación especificada no existe');
    }
  }

  // Validar cantidad y precio si se cambian
  const quantity = payload.quantity !== undefined ? payload.quantity : item.quantity;
  const unitValue = payload.unitValue !== undefined ? payload.unitValue : item.unitValue;
  
  if (quantity <= 0) {
    throw new BusinessLogicError('La cantidad debe ser mayor a 0');
  }
  if (unitValue <= 0) {
    throw new BusinessLogicError('El precio unitario debe ser mayor a 0');
  }

  // Recalcular total del item
  const itemSubTotal = quantity * unitValue;
  const itemTaxes = payload.taxes !== undefined ? payload.taxes : item.taxes;
  payload.total = itemSubTotal + itemTaxes;

  const updated = await invoiceItemRepository.update(item, payload);

  // Recalcular totales de la factura
  await invoiceService.recalculateInvoiceTotals(item.invoiceId);

  return invoiceItemRepository.findById(updated.id);
};

const removeItem = async (id) => {
  const item = await invoiceItemRepository.findById(id);
  if (!item) {
    throw new NotFoundError('Item de factura no encontrado');
  }

  const invoice = await db.modules.bussines.Invoice.findByPk(item.invoiceId);
  if (!invoice) {
    throw new NotFoundError('Factura asociada no encontrada');
  }

  // No permitir eliminar items de facturas anuladas o pagadas
  if (invoice.status === 'anulada' || invoice.status === 'pagada') {
    throw new BusinessLogicError(`No se pueden eliminar items de una factura en estado '${invoice.status}'`);
  }

  await invoiceItemRepository.remove(id);

  // Recalcular totales de la factura
  await invoiceService.recalculateInvoiceTotals(item.invoiceId);

  return { message: 'Item eliminado exitosamente' };
};

module.exports = {
  listItems,
  getItemsByInvoiceId,
  getItemById,
  createItem,
  updateItem,
  removeItem,
};

