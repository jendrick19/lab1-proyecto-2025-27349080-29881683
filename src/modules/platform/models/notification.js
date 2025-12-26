'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {

    static associate(models) {

      Notification.belongsTo(models.PeopleAttended, {
        foreignKey: 'peopleId',
        as: 'peopleAttended'
      });

      Notification.belongsTo(models.Appointment, {
        foreignKey: 'appointmentId',
        as: 'appointment'
      });

      Notification.belongsTo(models.Result, {
        foreignKey: 'resultId',
        as: 'result'
      });

      Notification.belongsTo(models.Invoice, {
        foreignKey: 'invoiceId',
        as: 'invoice'
      });
    }
  }

  Notification.init({
    peopleId: DataTypes.INTEGER,
    appointmentId: DataTypes.INTEGER,
    resultId: DataTypes.INTEGER,
    invoiceId: DataTypes.INTEGER,
    type: {
      type: DataTypes.ENUM('email', 'sms', 'push'),
      allowNull: false,
      defaultValue: 'email'
    },
    recipient: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    template: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    subject: DataTypes.STRING(255),
    payload: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('payload');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('payload', JSON.stringify(value));
      }
    },
    status: {
      type: DataTypes.ENUM('pendiente', 'enviado', 'error', 'reintentado'),
      allowNull: false,
      defaultValue: 'pendiente'
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    errorMessage: DataTypes.TEXT,
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('metadata');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('metadata', value ? JSON.stringify(value) : null);
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    sentDate: DataTypes.DATE,
    nextAttempt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Notification',
    hooks: {
      beforeCreate: async (notification) => {
        const relations = [
          notification.appointmentId,
          notification.resultId,
          notification.invoiceId
        ].filter(id => id !== null && id !== undefined);

        if (relations.length > 1) {
          throw new Error('Una notificación solo puede estar asociada a una cita, resultado o factura');
        }
      },
      beforeUpdate: async (notification) => {
        
        if (notification.changed('status') && notification.status === 'error') {
          notification.attempts += 1;
          
          if (notification.attempts < 5) {
            const minutesDelay = Math.pow(2, notification.attempts) * 5;
            notification.nextAttempt = new Date(Date.now() + minutesDelay * 60000);
          }
        }
   
        if (notification.changed('status') && notification.status === 'enviado') {
          notification.sentDate = new Date();
          notification.nextAttempt = null;
        }
      }
    }
  });

  return Notification;
};


