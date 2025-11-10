'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Diagnosis extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Diagnosis.belongsTo(models.Episode, {
        foreignKey: 'episodeId',
        as: 'episode'
      });
    }
  }
  Diagnosis.init({
    episodeId: DataTypes.INTEGER,
    code: DataTypes.STRING,
    description: DataTypes.TEXT,
    type: DataTypes.STRING,
    isPrimary: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Diagnosis',
  });
  return Diagnosis;
};