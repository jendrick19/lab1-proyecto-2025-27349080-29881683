'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ClinicalNoteVersion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ClinicalNoteVersion.init({
    noteId: DataTypes.INTEGER,
    versionDate: DataTypes.DATE,
    subjective: DataTypes.TEXT,
    objective: DataTypes.TEXT,
    analysis: DataTypes.TEXT,
    plan: DataTypes.TEXT,
    attachments: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ClinicalNoteVersion',
  });
  return ClinicalNoteVersion;
};