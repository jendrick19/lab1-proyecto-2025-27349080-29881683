'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Professional, {
        foreignKey: 'userId',
        as: 'professional'
      });
      User.hasMany(models.AccessLog, {
        foreignKey: 'userId',
        as: 'accessLogs'
      });
      
      // Relación muchos a muchos con Role a través de UserRole
      User.belongsToMany(models.Role, {
        through: models.UserRole,
        foreignKey: 'userId',
        otherKey: 'roleId',
        as: 'roles'
      });

      // Relación directa con tabla intermedia
      User.hasMany(models.UserRole, {
        foreignKey: 'userId',
        as: 'userRoles'
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