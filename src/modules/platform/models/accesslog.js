'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AccessLog extends Model {
    static associate(models) {
      AccessLog.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  AccessLog.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    recurso: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Endpoint o recurso accedido (ej: /api/appointments)'
    },
    accion: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Método HTTP (GET, POST, PUT, DELETE, etc.)'
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Dirección IP del cliente'
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User Agent del navegador o cliente'
    },
    statusCode: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Código de respuesta HTTP'
    },
    responseTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tiempo de respuesta en milisegundos'
    }
  }, {
    sequelize,
    modelName: 'AccessLog',
    tableName: 'AccessLogs',
  });
  return AccessLog;
};

