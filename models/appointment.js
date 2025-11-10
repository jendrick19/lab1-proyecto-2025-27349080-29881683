'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Appointment.belongsTo(models.Professional, {
        foreignKey: 'professionalId',
        as: 'professional'
      });

      Appointment.belongsTo(models.PeopleAttended, {
        foreignKey: 'peopleId',
        as: 'peopleAttended'
      });

      Appointment.belongsTo(models.Schedule, {
        foreignKey: 'scheduleId',
        as: 'schedule'
      });

      Appointment.belongsTo(models.CareUnit, {
        foreignKey: 'unitId',
        as: 'careUnit'
      });
    }
  }
  Appointment.init({
    peopleId: DataTypes.INTEGER,
    professionalId: DataTypes.INTEGER,
    unitId: DataTypes.INTEGER,
    startTime: DataTypes.DATE,
    endTime: DataTypes.DATE,
    reason: DataTypes.STRING,
    channel: DataTypes.STRING,
    status: DataTypes.STRING,
    observations: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Appointment',
  });
  return Appointment;
};