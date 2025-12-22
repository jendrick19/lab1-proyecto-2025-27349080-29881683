'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Insurer extends Model {
    static associate(models) {
      // Relación con Planes
      Insurer.hasMany(models.Plan, {
        foreignKey: 'aseguradoraId',
        as: 'planes'
      });
      Insurer.hasMany(models.Invoice, {
        foreignKey: 'insurerId',
        as: 'invoices'
      });
    }
  }
  
  Insurer.init({
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    nit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    contacto: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo'),
      allowNull: false,
      defaultValue: 'activo'
    }
  }, {
    sequelize,
    modelName: 'Insurer',
    tableName: 'Insurers',
  });
  
  return Insurer;
};

