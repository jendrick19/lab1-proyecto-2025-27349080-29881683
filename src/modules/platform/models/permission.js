'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      // Relación muchos a muchos con Role a través de RolePermission
      Permission.belongsToMany(models.Role, {
        through: models.RolePermission,
        foreignKey: 'permissionId',
        otherKey: 'roleId',
        as: 'roles'
      });

      // Relación directa con tabla intermedia
      Permission.hasMany(models.RolePermission, {
        foreignKey: 'permissionId',
        as: 'rolePermissions'
      });
    }
  }
  
  Permission.init({
    clave: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Clave única del permiso (ej: appointments.create, invoices.read)'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción de lo que permite hacer este permiso'
    }
  }, {
    sequelize,
    modelName: 'Permission',
    tableName: 'Permissions',
  });
  
  return Permission;
};

