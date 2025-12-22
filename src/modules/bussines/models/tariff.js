'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tariff extends Model {
    static associate(models) {
      Tariff.belongsTo(models.Service, {
        foreignKey: 'serviceCode',
        targetKey: 'code',
        as: 'service'
      });
      Tariff.belongsTo(models.Plan, {
        foreignKey: 'planId',
        as: 'plan'
      });
    }
  }
  Tariff.init({
    serviceCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'Services',
        key: 'code'
      }
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Nullable para tarifa general
      references: {
        model: 'Plans',
        key: 'id'
      }
    },
    baseValue: DataTypes.FLOAT,
    taxes: DataTypes.FLOAT,
    effectiveFrom: DataTypes.DATE,
    effectiveTo: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Tariff',
  });
  return Tariff;
};

