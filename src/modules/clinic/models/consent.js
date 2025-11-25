'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Consent extends Model {
    static associate(models) {
      Consent.belongsTo(models.PeopleAttended, {
        foreignKey: 'peopleId',
        as: 'peopleAttended'
      });
    }
  }
  
  Consent.init({
    peopleId: DataTypes.INTEGER,
    procedureType: DataTypes.STRING,
    consentDate: DataTypes.DATE,
    method: DataTypes.ENUM('Firma digital', 'Aceptación verbal con registro'),
    fileId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Consent',
  });
  return Consent;
};