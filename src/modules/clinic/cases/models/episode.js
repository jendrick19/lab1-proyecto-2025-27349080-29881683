'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Episode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
    peopleId: DataTypes.INTEGER,
    openingDate: DataTypes.DATE,
    reason: DataTypes.STRING,
    type: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Episode',
  });
  return Episode;
};