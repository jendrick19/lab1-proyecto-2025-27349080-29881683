 'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Episode extends Model {
   
    static associate(models) {
      Episode.hasMany(models.ClinicalNote, {
        foreignKey: 'episodeId',
        as: 'clinicalNotes'
      });

      Episode.belongsTo(models.PeopleAttended, {
        foreignKey: 'peopleId',
        as: 'peopleAttended'
      });

      Episode.hasMany(models.Diagnosis, {
        foreignKey: 'episodeId',
        as: 'diagnosis'
      });
      
    }
  }
  Episode.init({
    peopleId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    openingDate: DataTypes.DATE,
    reason: DataTypes.STRING,
    type: {
      type: DataTypes.ENUM('Consulta', 'Procedimiento', 'Control', 'Urgencia'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Abierto', 'Cerrado'),
      allowNull: false,
      defaultValue: 'Abierto'
    }
  }, {
    sequelize,
    modelName: 'Episode',
  });
  return Episode;
};