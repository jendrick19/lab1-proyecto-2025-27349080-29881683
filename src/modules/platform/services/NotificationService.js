const nodemailer = require('nodemailer');
const { Notification } = require('../../../../database/models');
const { Op } = require('sequelize');
const NotificationRepository = require('../repositories/NotificationRepository');
const { getPagination, getPaginationMeta } = require('../../../shared/utils/paginationHelper');
const { getEmailTemplate } = require('../templates/emailTemplates');

class NotificationService {
  constructor() {
    // Configuración de Nodemailer - ajustar según proveedor
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      pool: true, // Usar pool de conexiones
      maxConnections: 5,
      maxMessages: 100
    });

    // Verificar conexión al iniciar
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Servidor de email listo para enviar mensajes');
    } catch (error) {
      console.error('Error al verificar conexión SMTP:', error.message);
    }
  }

  async listNotifications(filters) {
    try {
      const { page, limit, sortBy, sortOrder } = filters;
      const { offset, limit: pageLimit } = getPagination(page, limit);

      const where = {};
      
      if (filters.peopleId) {
        where.peopleId = filters.peopleId;
      }
      if (filters.appointmentId) {
        where.appointmentId = filters.appointmentId;
      }
      if (filters.type) {
        where.type = filters.type;
      }
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.template) {
        where.template = filters.template;
      }
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
          where.createdAt[Op.gte] = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.createdAt[Op.lte] = new Date(filters.endDate);
        }
      }

      const orderMap = {
        fecha: 'createdAt',
        estado: 'status',
        tipo: 'type'
      };
      const orderField = orderMap[sortBy] || 'createdAt';
      const order = [[orderField, sortOrder?.toUpperCase() || 'DESC']];

      const { rows: notifications, count } = await NotificationRepository.findAndCountAll({
        where,
        offset,
        limit: pageLimit,
        order
      });

      const pagination = getPaginationMeta(count, page, pageLimit);

      return {
        notifications,
        pagination
      };
    } catch (error) {
      console.error('Error al listar notificaciones:', error);
      throw error;
    }
  }

  async getNotificationById(id) {
    try {
      return await NotificationRepository.findById(id);
    } catch (error) {
      console.error(`Error al obtener notificación ${id}:`, error);
      throw error;
    }
  }

  async createNotification(data) {
    try {
      const notification = await NotificationRepository.create({
        peopleId: data.peopleId,
        appointmentId: data.appointmentId,
        resultId: data.resultId,
        invoiceId: data.invoiceId,
        type: data.type || 'email',
        recipient: data.recipient,
        template: data.template,
        subject: data.subject,
        payload: data.payload,
        status: 'pendiente'
      });

      
      await this.sendNotification(notification.id);
      
      return await NotificationRepository.findById(notification.id);
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  }

  async sendNotification(notificationId) {
    try {
      const notification = await NotificationRepository.findById(notificationId);

      if (!notification) {
        throw new Error(`Notificación ${notificationId} no encontrada`);
      }

      if (notification.status === 'enviado') {
        console.log(`Notificación ${notificationId} ya fue enviada`);
        return notification;
      }

      if (notification.attempts >= 5) {
        console.log(`Notificación ${notificationId} alcanzó máximo de intentos`);
        return notification;
      }

      let result;
      switch (notification.type) {
        case 'email':
          result = await this.sendEmail(notification);
          break;
        case 'sms':
          result = await this.sendSMS(notification);
          break;
        case 'push':
          result = await this.sendPush(notification);
          break;
        default:
          throw new Error(`Tipo de notificación no soportado: ${notification.type}`);
      }

      await NotificationRepository.update(notification, {
        status: 'enviado',
        metadata: result
      });

      return await NotificationRepository.findById(notificationId);
    } catch (error) {
      
      const notification = await Notification.findByPk(notificationId);
      if (notification) {
        await NotificationRepository.update(notification, {
          status: 'error',
          errorMessage: error.message
        });
      }
      
      console.error(`Error al enviar notificación ${notificationId}:`, error);
      throw error;
    }
  }

  async resendNotification(notificationId) {
    try {
      const notification = await NotificationRepository.findById(notificationId);

      if (!notification) {
        throw new Error(`Notificación ${notificationId} no encontrada`);
      }

      if (notification.status !== 'error') {
        throw new Error(`Solo se pueden reenviar notificaciones con estado 'error'`);
      }

      if (notification.attempts >= 5) {
        throw new Error(`La notificación alcanzó el máximo de intentos permitidos`);
      }

      await NotificationRepository.update(notification, {
        status: 'pendiente',
        errorMessage: null
      });

      return await this.sendNotification(notificationId);

    } catch (error) {
      console.error(`Error al reenviar notificación ${notificationId}:`, error);
      throw error;
    }
  }

  async sendEmail(notification) {
    const template = getEmailTemplate(notification.template, notification.payload);
    
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Sistema Clínica'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: notification.recipient,
      subject: notification.subject || template.subject,
      html: template.html,
      text: template.text
    };

    const info = await this.transporter.sendMail(mailOptions);

    return {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
      sentAt: new Date().toISOString()
    };
  }

  async processRetryQueue() {
    try {
      const pendingRetries = await NotificationRepository.findPendingRetries(10);

      console.log(`📤 Procesando ${pendingRetries.length} notificaciones pendientes`);

      for (const notification of pendingRetries) {
        try {
          await this.sendNotification(notification.id);
          console.log(`Notificación ${notification.id} reenviada exitosamente`);
        } catch (error) {
          console.error(`Error al reenviar notificación ${notification.id}:`, error.message);
        }
      }

      return pendingRetries.length;
    } catch (error) {
      console.error('Error al procesar cola de reintentos:', error);
      throw error;
    }
  }

  async getStatistics(filters = {}) {
    try {
      return await NotificationRepository.getStatistics(filters);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  close() {
    this.transporter.close();
  }
}

const notificationServiceInstance = new NotificationService();

module.exports = {
  ...notificationServiceInstance,
  listNotifications: notificationServiceInstance.listNotifications.bind(notificationServiceInstance),
  getNotificationById: notificationServiceInstance.getNotificationById.bind(notificationServiceInstance),
  createNotification: notificationServiceInstance.createNotification.bind(notificationServiceInstance),
  sendNotification: notificationServiceInstance.sendNotification.bind(notificationServiceInstance),
  resendNotification: notificationServiceInstance.resendNotification.bind(notificationServiceInstance),
  getStatistics: notificationServiceInstance.getStatistics.bind(notificationServiceInstance),
  processRetryQueue: notificationServiceInstance.processRetryQueue.bind(notificationServiceInstance),
  close: notificationServiceInstance.close.bind(notificationServiceInstance)
};


