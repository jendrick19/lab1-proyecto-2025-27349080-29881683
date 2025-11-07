'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PersonaAtendidas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tipoDocumento: {
        type: Sequelize.ENUM('Cedula', 'RIF', 'Pasaporte', 'Otro')
      },
      numeroDocumento: {
        type: Sequelize.STRING
      },
      nombres: {
        type: Sequelize.STRING
      },
      apellidos: {
        type: Sequelize.STRING
      },
      fechaNacimiento: {
        type: Sequelize.DATE
      },
      sexo: {
        type: Sequelize.ENUM('M', 'F', 'O')
      },
      telefono: {
        type: Sequelize.STRING
      },
      correo: {
        type: Sequelize.STRING
      },
      direccion: {
        type: Sequelize.STRING
      },
      contactoEmergencia: {
        type: Sequelize.STRING
      },
      alergias: {
        type: Sequelize.STRING
      },
      estado: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PersonaAtendidas');
  }
};