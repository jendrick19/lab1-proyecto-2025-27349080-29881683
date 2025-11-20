'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AppointmentHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      AppointmentHistory.belongsTo(models.Appointment, {
        foreignKey: 'appointmentId',
        as: 'appointment'
      });
    }
  }
  AppointmentHistory.init({
    appointmentId: DataTypes.INTEGER,
    oldStatus: DataTypes.STRING,
    newStatus: DataTypes.STRING,
    oldStartTime: DataTypes.DATE,
    newStartTime: DataTypes.DATE,
    oldEndTime: DataTypes.DATE,
    newEndTime: DataTypes.DATE,
    changeReason: DataTypes.TEXT,
    changedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'AppointmentHistory',
  });
  return AppointmentHistory;
};

