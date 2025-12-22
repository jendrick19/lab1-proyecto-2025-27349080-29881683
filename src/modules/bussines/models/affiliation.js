'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Affiliation extends Model {
    static associate(models) {
      Affiliation.belongsTo(models.PeopleAttended, {
        foreignKey: 'peopleId',
        as: 'peopleAttended'
      });
      Affiliation.belongsTo(models.Plan, {
        foreignKey: 'planId',
        as: 'plan'
      });
    }
  }
  Affiliation.init({
    peopleId: DataTypes.INTEGER,
    planId: DataTypes.INTEGER,
    policyNumber: DataTypes.STRING,
    effectiveFrom: DataTypes.DATE,
    effectiveTo: DataTypes.DATE,
    copayment: DataTypes.FLOAT,
    moderationFee: DataTypes.FLOAT,
    status: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Affiliation',
  });
  return Affiliation;
};

