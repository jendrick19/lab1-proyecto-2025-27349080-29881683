const { Op } = require('sequelize');
const paymentRepository = require('../repositories/PaymentRepository');
const invoiceService = require('./InvoiceService');
const { buildPaginationParams, buildPaginationResponse } = require('../../../shared/utils/paginationHelper');
const { addDateRangeToWhere } = require('../../../shared/utils/dateRangeHelper');
const { NotFoundError, BusinessLogicError } = require('../../../shared/errors/CustomErrors');
const db = require('../../../../database/models');

const SORT_FIELDS = {
  fecha: 'date',
  monto: 'amount',
  estado: 'status',
  createdAt: 'createdAt',
};

const ALLOWED_PAYMENT_STATUS_TRANSITIONS = {
  'pendiente': ['completado', 'cancelado', 'rechazado'],
  'completado': [], // Estado final
  'cancelado': [], // Estado final
  'rechazado': [] // Estado final
};

const buildWhere = ({ facturaId, estado, medio, fechaDesde, fechaHasta }) => {
  const where = {};
  if (facturaId) {
    where.invoiceId = Number(facturaId);
  }
  if (estado) {
    if (Array.isArray(estado)) {
      where.status = { [Op.in]: estado };
    } else {
      where.status = estado;
    }
  }
  if (medio) {
    where.method = medio;
  }
  addDateRangeToWhere(where, 'date', fechaDesde, fechaHasta);
  return where;
};

const validatePaymentStatusTransition = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) {
    return true;
  }
  
  const allowed = ALLOWED_PAYMENT_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new BusinessLogicError(
      `No se puede cambiar el estado del pago de '${currentStatus}' a '${newStatus}'. Transiciones permitidas: ${allowed.join(', ') || 'ninguna'}`
    );
  }
  return true;
};

// Calcular saldo pendiente de una factura
const calculatePendingBalance = async (invoiceId) => {
  const invoice = await db.modules.bussines.Invoice.findByPk(invoiceId);
  if (!invoice) {
    throw new NotFoundError('Factura no encontrada');
  }

  const completedPaymentsTotal = await paymentRepository.getCompletedPaymentsTotal(invoiceId);
  return invoice.total - completedPaymentsTotal;
};

const listPayments = async ({
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
  const { count, rows } = await paymentRepository.findAndCountAll({
    where,
    offset,
    limit: safeLimit,
    order: [[orderField, orderDirection]],
  });
  return buildPaginationResponse(rows, count, safePage, safeLimit);
};

const getPaymentById = async (id) => {
  const payment = await paymentRepository.findById(id);
  if (!payment) {
    throw new NotFoundError('Pago no encontrado');
  }
  return payment;
};

const getPaymentsByInvoiceId = async (invoiceId) => {
  const invoice = await db.modules.bussines.Invoice.findByPk(invoiceId);
  if (!invoice) {
    throw new NotFoundError('Factura no encontrada');
  }
  return paymentRepository.findByInvoiceId(invoiceId);
};

const createPayment = async (payload) => {
  const invoice = await db.modules.bussines.Invoice.findByPk(payload.invoiceId);
  if (!invoice) {
    throw new NotFoundError('Factura no encontrada');
  }

  // Validar que la factura está en estado válido para recibir pagos
  if (invoice.status === 'anulada') {
    throw new BusinessLogicError('No se pueden crear pagos para facturas anuladas');
  }
  if (invoice.status === 'pagada') {
    throw new BusinessLogicError('No se pueden crear pagos para facturas ya pagadas completamente');
  }

  // Validar monto
  if (!payload.amount || payload.amount <= 0) {
    throw new BusinessLogicError('El monto debe ser mayor a 0');
  }

  // Validar que el pago no exceda el saldo pendiente (REGLA 2)
  const pendingBalance = await calculatePendingBalance(payload.invoiceId);
  if (payload.amount > pendingBalance + 0.01) { // Tolerancia de 1 céntimo
    throw new BusinessLogicError(
      `El monto del pago (${payload.amount}) excede el saldo pendiente de la factura (${pendingBalance})`
    );
  }

  const payment = await paymentRepository.create({
    ...payload,
    status: payload.status || 'pendiente'
  });

  // Actualizar estado de la factura según pagos
  await invoiceService.updateInvoiceStatusFromPayments(invoice);

  return paymentRepository.findById(payment.id);
};

const updatePayment = async (id, payload) => {
  const payment = await paymentRepository.findById(id);
  if (!payment) {
    throw new NotFoundError('Pago no encontrado');
  }

  // Validar transición de estado
  if (payload.status && payload.status !== payment.status) {
    validatePaymentStatusTransition(payment.status, payload.status);
  }

  // Si se cambia el monto, validar que no exceda el saldo pendiente
  if (payload.amount !== undefined && payload.amount !== payment.amount) {
    if (payload.amount <= 0) {
      throw new BusinessLogicError('El monto debe ser mayor a 0');
    }

    // Calcular saldo pendiente excluyendo este pago
    const invoice = await db.modules.bussines.Invoice.findByPk(payment.invoiceId);
    const currentCompletedTotal = await paymentRepository.getCompletedPaymentsTotal(payment.invoiceId);
    
    // Si este pago estaba completado, restarlo del total
    const adjustedTotal = payment.status === 'completado' 
      ? currentCompletedTotal - payment.amount 
      : currentCompletedTotal;
    
    const pendingBalance = invoice.total - adjustedTotal;
    
    if (payload.amount > pendingBalance + 0.01) {
      throw new BusinessLogicError(
        `El nuevo monto del pago (${payload.amount}) excede el saldo pendiente de la factura (${pendingBalance})`
      );
    }
  }

  // Si se cambia la factura, validar todo de nuevo
  if (payload.invoiceId && payload.invoiceId !== payment.invoiceId) {
    const newInvoice = await db.modules.bussines.Invoice.findByPk(payload.invoiceId);
    if (!newInvoice) {
      throw new NotFoundError('La nueva factura especificada no existe');
    }
    if (newInvoice.status === 'anulada' || newInvoice.status === 'pagada') {
      throw new BusinessLogicError(`No se pueden asignar pagos a facturas en estado '${newInvoice.status}'`);
    }
  }

  const updated = await paymentRepository.update(payment, payload);

  // Actualizar estado de la factura si cambió el estado del pago
  if (payload.status && payload.status !== payment.status) {
    const invoiceId = payload.invoiceId || payment.invoiceId;
    const invoice = await db.modules.bussines.Invoice.findByPk(invoiceId);
    await invoiceService.updateInvoiceStatusFromPayments(invoice);
  }

  return paymentRepository.findById(updated.id);
};

module.exports = {
  listPayments,
  getPaymentById,
  getPaymentsByInvoiceId,
  createPayment,
  updatePayment,
  calculatePendingBalance,
};

