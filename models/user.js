'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Un usuario tiene un profesional
      User.hasOne(models.Professional, {
        foreignKey: 'userId',
        as: 'professional'
      });
    }
  }
  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    passwordHash: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
    creationDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};