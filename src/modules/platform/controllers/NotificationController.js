const {
  listNotifications,
  getNotificationById,
  createNotification,
  sendNotification,
  resendNotification,
  getStatistics,
  processRetryQueue
} = require('../services/NotificationService');

/**
 * Mapear modelo a respuesta de API
 */
const mapModelToResponse = (notification) => {
  if (!notification) return null;

  return {
    id: notification.id,
    paciente: notification.peopleAttended ? {
      id: notification.peopleAttended.id,
      nombres: notification.peopleAttended.names,
      apellidos: notification.peopleAttended.surNames,
      email: notification.peopleAttended.email
    } : undefined,
    cita: notification.appointment ? {
      id: notification.appointment.id,
      inicio: notification.appointment.startTime,
      estado: notification.appointment.status
    } : undefined,
    resultado: notification.result ? {
      id: notification.result.id,
      tipo: notification.result.testType
    } : undefined,
    factura: notification.invoice ? {
      id: notification.invoice.id,
      numero: notification.invoice.invoiceNumber,
      total: notification.invoice.totalAmount
    } : undefined,
    tipo: notification.type,
    destinatario: notification.recipient,
    plantilla: notification.template,
    asunto: notification.subject,
    estado: notification.status,
    intentos: notification.attempts,
    mensajeError: notification.errorMessage,
    metadatos: notification.metadata,
    fechaCreacion: notification.createdAt,
    fechaEnvio: notification.sentDate,
    proximoIntento: notification.nextAttempt
  };
};

const mapRequestToCreate = (body) => {
  const payload = {
    type: body.tipo || 'email',
    recipient: body.destinatario,
    template: body.plantilla,
    subject: body.asunto,
    payload: body.datos || {}
  };

  if (body.pacienteId !== undefined) payload.peopleId = body.pacienteId;
  if (body.citaId !== undefined) payload.appointmentId = body.citaId;
  if (body.resultadoId !== undefined) payload.resultId = body.resultadoId;
  if (body.facturaId !== undefined) payload.invoiceId = body.facturaId;

  return payload;
};

const listHandler = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'fecha',
      sortOrder = 'desc',
      pacienteId,
      citaId,
      tipo,
      estado,
      plantilla,
      fechaDesde,
      fechaHasta
    } = req.query;

    const result = await listNotifications({
      page,
      limit,
      sortBy,
      sortOrder,
      peopleId: pacienteId,
      appointmentId: citaId,
      type: tipo,
      status: estado,
      template: plantilla,
      startDate: fechaDesde,
      endDate: fechaHasta
    });

    const response = {
      data: result.notifications.map(mapModelToResponse),
      pagination: result.pagination
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const getHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await getNotificationById(id);

    if (!notification) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Notificación con id ${id} no encontrada`
      });
    }

    res.status(200).json(mapModelToResponse(notification));
  } catch (error) {
    next(error);
  }
};

const createHandler = async (req, res, next) => {
  try {
    const data = mapRequestToCreate(req.body);
    const notification = await createNotification(data);

    res.status(201).json(mapModelToResponse(notification));
  } catch (error) {
    next(error);
  }
};

const sendHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await sendNotification(id);

    if (!notification) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Notificación con id ${id} no encontrada`
      });
    }

    res.status(200).json(mapModelToResponse(notification));
  } catch (error) {
    next(error);
  }
};

const resendHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await resendNotification(id);

    if (!notification) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Notificación con id ${id} no encontrada`
      });
    }

    res.status(200).json(mapModelToResponse(notification));
  } catch (error) {
    next(error);
  }
};

const statisticsHandler = async (req, res, next) => {
  try {
    const {
      tipo,
      fechaDesde,
      fechaHasta
    } = req.query;

    const stats = await getStatistics({
      type: tipo,
      startDate: fechaDesde,
      endDate: fechaHasta
    });

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

const retryQueueHandler = async (req, res, next) => {
  try {
    const processed = await processRetryQueue();

    res.status(200).json({
      message: `Cola de reintentos procesada`,
      notificacionesProcesadas: processed
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listHandler,
  getHandler,
  createHandler,
  sendHandler,
  resendHandler,
  statisticsHandler,
  retryQueueHandler
};

