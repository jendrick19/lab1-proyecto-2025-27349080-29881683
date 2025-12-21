const {
  listPayments,
  getPaymentById,
  getPaymentsByInvoiceId,
  createPayment,
  updatePayment,
  calculatePendingBalance,
} = require('../services/PaymentService');

const mapModelToResponse = (payment) => {
  if (!payment) {
    return null;
  }
  return {
    id: payment.id,
    facturaId: payment.invoiceId,
    fecha: payment.date ? payment.date.toISOString() : null,
    monto: payment.amount,
    medio: payment.method,
    referencia: payment.reference,
    estado: payment.status,
    factura: payment.invoice ? {
      id: payment.invoice.id,
      numero: payment.invoice.number,
      total: payment.invoice.total,
      estado: payment.invoice.status,
    } : undefined,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
};

const mapRequestToCreate = (body) => {
  const payload = {
    invoiceId: body.facturaId,
    amount: body.monto,
    method: body.medio,
    reference: body.referencia,
    status: body.estado || 'pendiente',
  };
  
  if (body.fecha) {
    const date = new Date(body.fecha);
    if (!Number.isNaN(date.getTime())) {
      payload.date = date;
    }
  }
  
  return payload;
};

const mapRequestToUpdate = (body) => {
  const payload = {};
  if (body.facturaId !== undefined) payload.invoiceId = body.facturaId;
  if (body.monto !== undefined) payload.amount = body.monto;
  if (body.medio !== undefined) payload.method = body.medio;
  if (body.referencia !== undefined) payload.reference = body.referencia;
  if (body.estado !== undefined) payload.status = body.estado;
  if (body.fecha !== undefined) {
    const date = new Date(body.fecha);
    if (!Number.isNaN(date.getTime())) {
      payload.date = date;
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
      sortOrder = 'desc',
      facturaId,
      estado,
      medio,
      fechaDesde,
      fechaHasta,
    } = req.query;
    const result = await listPayments({
      page,
      limit,
      sortBy,
      sortOrder,
      filters: {
        facturaId,
        estado,
        medio,
        fechaDesde,
        fechaHasta,
      },
    });
    res.json({
      codigo: 200,
      mensaje: 'Lista de pagos obtenida exitosamente',
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
    const payment = await getPaymentById(id);
    return res.json({
      codigo: 200,
      mensaje: 'Pago encontrado',
      data: mapModelToResponse(payment),
    });
  } catch (error) {
    return next(error);
  }
};

const getByInvoiceHandler = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const payments = await getPaymentsByInvoiceId(invoiceId);
    const pendingBalance = await calculatePendingBalance(invoiceId);
    return res.json({
      codigo: 200,
      mensaje: 'Pagos de factura obtenidos exitosamente',
      data: payments.map(mapModelToResponse),
      saldoPendiente: pendingBalance,
    });
  } catch (error) {
    return next(error);
  }
};

const getPendingBalanceHandler = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const pendingBalance = await calculatePendingBalance(invoiceId);
    return res.json({
      codigo: 200,
      mensaje: 'Saldo pendiente obtenido exitosamente',
      saldoPendiente: pendingBalance,
    });
  } catch (error) {
    return next(error);
  }
};

const createHandler = async (req, res, next) => {
  try {
    const payload = mapRequestToCreate(req.body);
    const payment = await createPayment(payload);
    return res.status(201).json({
      codigo: 201,
      mensaje: 'Pago creado exitosamente',
      data: mapModelToResponse(payment),
    });
  } catch (error) {
    return next(error);
  }
};

const updateHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = mapRequestToUpdate(req.body);
    const updated = await updatePayment(id, payload);
    return res.json({
      codigo: 200,
      mensaje: 'Pago actualizado exitosamente',
      data: mapModelToResponse(updated),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listHandler,
  getHandler,
  getByInvoiceHandler,
  getPendingBalanceHandler,
  createHandler,
  updateHandler,
};

