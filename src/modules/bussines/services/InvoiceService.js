const { Op } = require('sequelize');
const invoiceRepository = require('../repositories/InvoiceRepository');
const invoiceItemRepository = require('../repositories/InvoiceItemRepository');
const paymentRepository = require('../repositories/PaymentRepository');
const tariffRepository = require('../repositories/TariffRepository');
const { buildPaginationParams, buildPaginationResponse } = require('../../../shared/utils/paginationHelper');
const { addDateRangeToWhere } = require('../../../shared/utils/dateRangeHelper');
const { NotFoundError, BusinessLogicError, ConflictError } = require('../../../shared/errors/CustomErrors');
const db = require('../../../../database/models');

const SORT_FIELDS = {
  numero: 'number',
  fechaEmision: 'issueDate',
  total: 'total',
  estado: 'status',
  createdAt: 'createdAt',
};

const ALLOWED_STATUS_TRANSITIONS = {
  'emitida': ['pendiente', 'pagada', 'anulada'],
  'pendiente': ['pagada', 'anulada'],
  'pagada': [], // Estado final
  'anulada': [] // Estado final
};

const buildWhere = ({ numero, personaId, aseguradoraId, estado, fechaEmisionDesde, fechaEmisionHasta, moneda }) => {
  const where = {};
  if (numero) {
    where.number = { [Op.like]: `%${numero}%` };
  }
  if (personaId) {
    where.peopleId = Number(personaId);
  }
  if (aseguradoraId) {
    where.insurerId = Number(aseguradoraId);
  }
  if (estado) {
    if (Array.isArray(estado)) {
      where.status = { [Op.in]: estado };
    } else {
      where.status = estado;
    }
  }
  if (moneda) {
    where.currency = moneda;
  }
  addDateRangeToWhere(where, 'issueDate', fechaEmisionDesde, fechaEmisionHasta);
  return where;
};

// Calcular totales de la factura desde los items
const calculateInvoiceTotals = (items) => {
  let subTotal = 0;
  let taxes = 0;
  let total = 0;

  items.forEach(item => {
    const itemSubTotal = item.quantity * item.unitValue;
    const itemTotal = itemSubTotal + item.taxes;
    subTotal += itemSubTotal;
    taxes += item.taxes;
    total += itemTotal;
  });

  return { subTotal, taxes, total };
};

// Validar que todos los items tengan prestación completada y precio vigente
const validateItemsForEmission = async (items) => {
  const errors = [];
  
  for (const item of items) {
    // Validar que la prestación existe
    const service = await db.modules.bussines.Service.findByPk(item.serviceCode);
    if (!service) {
      errors.push(`La prestación ${item.serviceCode} no existe`);
      continue;
    }
    
    // Validar que tiene precio (unitValue > 0)
    if (!item.unitValue || item.unitValue <= 0) {
      errors.push(`El item con prestación ${item.serviceCode} debe tener un precio unitario válido`);
    }
    
    // Validar que la cantidad es válida
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`El item con prestación ${item.serviceCode} debe tener una cantidad válida`);
    }
  }
  
  if (errors.length > 0) {
    throw new BusinessLogicError(`Errores en los items: ${errors.join('; ')}`);
  }
};

// Validar transición de estado
const validateStatusTransition = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) {
    return true; // No hay cambio
  }
  
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new BusinessLogicError(
      `No se puede cambiar el estado de '${currentStatus}' a '${newStatus}'. Transiciones permitidas: ${allowed.join(', ') || 'ninguna'}`
    );
  }
  return true;
};

// Actualizar estado de factura basado en pagos
const updateInvoiceStatusFromPayments = async (invoice) => {
  const completedPaymentsTotal = await paymentRepository.getCompletedPaymentsTotal(invoice.id);
  const remainingBalance = invoice.total - completedPaymentsTotal;
  
  let newStatus = invoice.status;
  
  // Solo actualizar si no está anulada
  if (invoice.status !== 'anulada') {
    if (Math.abs(remainingBalance) < 0.01) { // Considerar pagada si el saldo es menor a 1 céntimo
      newStatus = 'pagada';
    } else if (completedPaymentsTotal > 0 && invoice.status === 'emitida') {
      newStatus = 'pendiente';
    }
    
    if (newStatus !== invoice.status) {
      await invoice.update({ status: newStatus });
    }
  }
  
  return newStatus;
};

const listInvoices = async ({
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
  const { count, rows } = await invoiceRepository.findAndCountAll({
    where,
    offset,
    limit: safeLimit,
    order: [[orderField, orderDirection]],
  });
  return buildPaginationResponse(rows, count, safePage, safeLimit);
};

const getInvoiceById = async (id) => {
  const invoice = await invoiceRepository.findById(id, true, true);
  if (!invoice) {
    throw new NotFoundError('Factura no encontrada');
  }
  return invoice;
};

const createInvoice = async (payload, items = []) => {
  // Validar que la persona existe y está activa
  const person = await db.modules.operative.PeopleAttended.findByPk(payload.peopleId);
  if (!person) {
    throw new NotFoundError('La persona especificada no existe');
  }
  if (!person.status) {
    throw new BusinessLogicError('La persona especificada está inactiva');
  }

  // Validar que la aseguradora existe y está activa
  const insurer = await db.modules.bussines.Insurer.findByPk(payload.insurerId);
  if (!insurer) {
    throw new NotFoundError('La aseguradora especificada no existe');
  }
  if (insurer.estado !== 'activo') {
    throw new BusinessLogicError('La aseguradora especificada está inactiva');
  }

  // Validar que el número de factura sea único
  if (payload.number) {
    const existingInvoice = await invoiceRepository.findByNumber(payload.number);
    if (existingInvoice) {
      throw new ConflictError('Ya existe una factura con este número');
    }
  }

  // Las facturas siempre deben tener items (estado por defecto es "emitida")
  if (!items || items.length === 0) {
    throw new BusinessLogicError('No se puede crear una factura sin items');
  }
  
  await validateItemsForEmission(items);
  
  // Calcular totales desde los items
  const totals = calculateInvoiceTotals(items);
  payload.subTotal = totals.subTotal;
  payload.taxes = totals.taxes;
  payload.total = totals.total;

  // Validar consistencia de totales
  const calculatedTotal = payload.subTotal + payload.taxes;
  if (Math.abs(calculatedTotal - payload.total) > 0.01) {
    throw new BusinessLogicError(`El total debe ser igual a subTotal + impuestos (${calculatedTotal} vs ${payload.total})`);
  }

  const invoice = await invoiceRepository.create(payload);

  // Crear items si se proporcionan
  if (items && items.length > 0) {
    const itemsToCreate = items.map(item => ({
      ...item,
      invoiceId: invoice.id,
      // Calcular total del item si no viene
      total: item.total || (item.quantity * item.unitValue + (item.taxes || 0))
    }));
    await invoiceItemRepository.createBulk(itemsToCreate);
  }

  return invoiceRepository.findById(invoice.id, true, false);
};

const updateInvoice = async (id, payload) => {
  const invoice = await invoiceRepository.findById(id, false, false);
  if (!invoice) {
    throw new NotFoundError('Factura no encontrada');
  }

  // Validar transición de estado
  if (payload.status && payload.status !== invoice.status) {
    validateStatusTransition(invoice.status, payload.status);
    
    // Si se intenta cambiar a "emitida", validar items
    if (payload.status === 'emitida') {
      const items = await invoiceItemRepository.findByInvoiceId(id);
      if (!items || items.length === 0) {
        throw new BusinessLogicError('No se puede emitir una factura sin items');
      }
      await validateItemsForEmission(items);
      
      // Recalcular totales
      const totals = calculateInvoiceTotals(items);
      payload.subTotal = totals.subTotal;
      payload.taxes = totals.taxes;
      payload.total = totals.total;
    }
  }

  // Validar número único si se cambia
  if (payload.number && payload.number !== invoice.number) {
    const existingInvoice = await invoiceRepository.findByNumber(payload.number);
    if (existingInvoice) {
      throw new ConflictError('Ya existe una factura con este número');
    }
  }

  // Validar consistencia de totales si se actualizan
  if (payload.subTotal !== undefined || payload.taxes !== undefined || payload.total !== undefined) {
    const subTotal = payload.subTotal !== undefined ? payload.subTotal : invoice.subTotal;
    const taxes = payload.taxes !== undefined ? payload.taxes : invoice.taxes;
    const total = payload.total !== undefined ? payload.total : invoice.total;
    const calculatedTotal = subTotal + taxes;
    
    if (Math.abs(calculatedTotal - total) > 0.01) {
      throw new BusinessLogicError(`El total debe ser igual a subTotal + impuestos (${calculatedTotal} vs ${total})`);
    }
  }

  // Validar persona si se cambia
  if (payload.peopleId && payload.peopleId !== invoice.peopleId) {
    const person = await db.modules.operative.PeopleAttended.findByPk(payload.peopleId);
    if (!person) {
      throw new NotFoundError('La nueva persona especificada no existe');
    }
    if (!person.status) {
      throw new BusinessLogicError('La nueva persona especificada está inactiva');
    }
  }

  // Validar aseguradora si se cambia
  if (payload.insurerId && payload.insurerId !== invoice.insurerId) {
    const insurer = await db.modules.bussines.Insurer.findByPk(payload.insurerId);
    if (!insurer) {
      throw new NotFoundError('La nueva aseguradora especificada no existe');
    }
    if (insurer.estado !== 'activo') {
      throw new BusinessLogicError('La nueva aseguradora especificada está inactiva');
    }
  }

  const updated = await invoiceRepository.update(invoice, payload);
  return invoiceRepository.findById(updated.id, true, true);
};

// Recalcular totales de factura desde items
const recalculateInvoiceTotals = async (invoiceId) => {
  const invoice = await invoiceRepository.findById(invoiceId, false, false);
  if (!invoice) {
    throw new NotFoundError('Factura no encontrada');
  }

  // No recalcular si está anulada o pagada
  if (invoice.status === 'anulada' || invoice.status === 'pagada') {
    throw new BusinessLogicError(`No se pueden recalcular totales de una factura en estado '${invoice.status}'`);
  }

  const items = await invoiceItemRepository.findByInvoiceId(invoiceId);
  if (!items || items.length === 0) {
    throw new BusinessLogicError('La factura no tiene items para recalcular');
  }

  const totals = calculateInvoiceTotals(items);
  await invoice.update({
    subTotal: totals.subTotal,
    taxes: totals.taxes,
    total: totals.total
  });

  return invoiceRepository.findById(invoiceId, true, false);
};

module.exports = {
  listInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  recalculateInvoiceTotals,
  updateInvoiceStatusFromPayments,
  validateItemsForEmission,
  calculateInvoiceTotals,
};

