'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      // Relación muchos a muchos con User a través de UserRole
      Role.belongsToMany(models.User, {
        through: models.UserRole,
        foreignKey: 'roleId',
        otherKey: 'userId',
        as: 'users'
      });

      // Relación muchos a muchos con Permission a través de RolePermission
      Role.belongsToMany(models.Permission, {
        through: models.RolePermission,
        foreignKey: 'roleId',
        otherKey: 'permissionId',
        as: 'permissions'
      });

      // Relación directa con tablas intermedias
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
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Nombre del rol (ej: administrador, profesional, cajero, auditor)'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción del rol y sus responsabilidades'
    }
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'Roles',
  });
  
  return Role;
};

