'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PersonaAtendida extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PersonaAtendida.init({
    tipoDocumento: DataTypes.ENUM('Cedula', 'RIF', 'Pasaporte', 'Otro'),
    numeroDocumento: DataTypes.STRING,
    nombres: DataTypes.STRING,
    apellidos: DataTypes.STRING,
    fechaNacimiento: DataTypes.DATE,
    sexo: DataTypes.ENUM('M', 'F', 'O'),
    telefono: DataTypes.STRING,
    correo: DataTypes.STRING,
    direccion: DataTypes.STRING,
    contactoEmergencia: DataTypes.STRING,
    alergias: DataTypes.STRING,
    estado: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'PersonaAtendida',
  });
  return PersonaAtendida;
};