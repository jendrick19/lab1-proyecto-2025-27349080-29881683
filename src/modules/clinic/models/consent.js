'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Consent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
    method: DataTypes.STRING,
    fileId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Consent',
  });
  return Consent;
};