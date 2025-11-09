'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ClinicalNote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ClinicalNote.init({
    episodeId: DataTypes.INTEGER,
    professionalId: DataTypes.INTEGER,
    noteDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'ClinicalNote',
  });
  return ClinicalNote;
};