'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate(models) {
      // Relación con InvoiceItems (cuando se cree el modelo Invoice)
      if (models.InvoiceItem) {
        Service.hasMany(models.InvoiceItem, {
          foreignKey: 'prestacionId',
          as: 'invoiceItems'
        });
      }
      // Relación con Tariffs
      if (models.Tariff) {
        Service.hasMany(models.Tariff, {
          foreignKey: 'serviceCode',
          sourceKey: 'code',
          as: 'tariffs'
        });
      }
    }
  }
  Service.init({
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    name: DataTypes.STRING(200),
    group: DataTypes.STRING(100),
    requirements: DataTypes.STRING(500),
    estimatedTime: DataTypes.STRING(50),
    requiresAuthorization: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Service',
  });
  return Service;
};

