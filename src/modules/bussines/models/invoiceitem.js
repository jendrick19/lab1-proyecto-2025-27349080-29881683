'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InvoiceItem extends Model {
    static associate(models) {
      InvoiceItem.belongsTo(models.Invoice, {
        foreignKey: 'invoiceId',
        as: 'invoice'
      });
      InvoiceItem.belongsTo(models.Service, {
        foreignKey: 'serviceCode',
        targetKey: 'code',
        as: 'service'
      });
    }
  }
  InvoiceItem.init({
    invoiceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Invoices',
        key: 'id'
      }
    },
    serviceCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'Services',
        key: 'code'
      }
    },
    description: DataTypes.STRING(500),
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    unitValue: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    taxes: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'InvoiceItem',
  });
  return InvoiceItem;
};

