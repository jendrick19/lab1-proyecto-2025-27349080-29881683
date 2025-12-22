'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    static associate(models) {
      Invoice.belongsTo(models.PeopleAttended, {
        foreignKey: 'peopleId',
        as: 'peopleAttended'
      });
      Invoice.belongsTo(models.Insurer, {
        foreignKey: 'insurerId',
        as: 'insurer'
      });
      Invoice.hasMany(models.InvoiceItem, {
        foreignKey: 'invoiceId',
        as: 'items'
      });
      Invoice.hasMany(models.Payment, {
        foreignKey: 'invoiceId',
        as: 'payments'
      });
    }
  }
  Invoice.init({
    number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    issueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    peopleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PeopleAttendeds',
        key: 'id'
      }
    },
    insurerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Insurers',
        key: 'id'
      }
    },
    currency: {
      type: DataTypes.ENUM('VES', 'USD', 'EUR'),
      allowNull: false,
      defaultValue: 'VES'
    },
    subTotal: {
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
    },
    status: {
      type: DataTypes.ENUM('emitida', 'pagada', 'pendiente', 'anulada'),
      allowNull: false,
      defaultValue: 'emitida'
    }
  }, {
    sequelize,
    modelName: 'Invoice',
  });
  return Invoice;
};

