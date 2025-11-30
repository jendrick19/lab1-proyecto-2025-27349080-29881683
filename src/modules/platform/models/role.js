'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.hasMany(models.UserRole, {
        foreignKey: 'roleId',
        as: 'userRoles'
      });

      Role.hasMany(models.RolePermission, {
        foreignKey: 'roleId',
        as: 'rolePermissions'
      });
    }
  }
  Role.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Role',
  });
  return Role;
};

