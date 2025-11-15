'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PeopleAttended extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PeopleAttended.hasMany(models.Episode, {
        foreignKey: 'peopleId',
        as: 'episodes'
      });

      PeopleAttended.hasMany(models.Appointment, {
        foreignKey: 'peopleId',
        as: 'appointments'
      });

      PeopleAttended.hasMany(models.Consent, {
        foreignKey: 'peopleId',
        as: 'consents'
      });
    }
  }
  PeopleAttended.init({
    documentType: DataTypes.STRING,
    documentId: DataTypes.STRING,
    names: DataTypes.STRING,
    surNames: DataTypes.STRING,
    dateOfBirth: DataTypes.DATE,
    gender: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    address: DataTypes.STRING,
    emergencyContact: DataTypes.STRING,
    allergies: DataTypes.STRING,
    status: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'PeopleAttended',
  });
  return PeopleAttended;
};