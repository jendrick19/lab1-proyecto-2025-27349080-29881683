'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Authorization extends Model {
    static associate(models) {
      Authorization.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order'
      });
      Authorization.belongsTo(models.Plan, {
        foreignKey: 'planId',
        as: 'plan'
      });
    }
  }
  Authorization.init({
    orderId: DataTypes.INTEGER,
    planId: DataTypes.INTEGER,
    procedureCode: DataTypes.STRING,
    status: DataTypes.ENUM('solicitada', 'aprobada', 'negada'),
    requestDate: DataTypes.DATE,
    responseDate: DataTypes.DATE,
    authorizationNumber: DataTypes.STRING,
    observations: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Authorization',
  });
  return Authorization;
};

