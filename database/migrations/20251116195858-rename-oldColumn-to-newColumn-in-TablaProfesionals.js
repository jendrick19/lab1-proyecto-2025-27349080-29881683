'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
   
    await queryInterface.renameColumn(
      'Profesionals', 
      'idUsuario',   
      'userId'        
    );

    await queryInterface.renameColumn(
      'Profesionals', 
      'nombres', 
      'names'
    );

    await queryInterface.renameColumn(
      'Profesionals', 
      'apellidos', 
      'surNames'
    );

    await queryInterface.renameColumn(
      'Profesionals', 
      'registroProfesional', 
      'professionalRegister'
    );

    await queryInterface.renameColumn(
      'Profesionals', 
      'especialidad', 
      'specialty'
    );

    await queryInterface.renameColumn(
      'Profesionals', 
      'correo', 
      'email'
    );

    await queryInterface.renameColumn(
      'Profesionals', 
      'telefono', 
      'phone'
    );

    await queryInterface.renameColumn(
      'Profesionals', 
      'agendaHabilitada', 
      'scheduleEnabled'
    );

    await queryInterface.renameColumn(
      'Profesionals', 
      'estado', 
      'status'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      'Profesionals', 
      'userId', 
      'idUsuario'
    );

    await queryInterface.renameColumn(
      'Profesionals', 
      'names', 
      'nombres'
    );

    await queryInterface.renameColumn(
      'Profesionals', 
      'surNames', 
      'apellidos'
    );

    await queryInterface.renameColumn(
      'Profesionals', 
      'professionalRegister', 
      'registroProfesional'
    );

    await queryInterface.renameColumn(
      'Profesionals', 
      'specialty', 
      'especialidad'
    );

    await queryInterface.renameColumn(
      'Profesionals', 
      'email', 
      'correo'
    );

    await queryInterface.renameColumn(
      'Profesionals', 
      'phone', 
      'telefono'
    );

    await queryInterface.renameColumn(
      'Profesionals', 
      'scheduleEnabled', 
      'agendaHabilitada'
    );

    await queryInterface.renameColumn(
      'Profesionals', 
      'status', 
      'estado'
    );
  },
};
