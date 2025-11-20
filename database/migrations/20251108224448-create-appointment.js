'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Appointments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      peopleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'PeopleAttendeds',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      professionalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Profesionals', // FK a la tabla Professionals
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      scheduleId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'Schedules', // FK a la tabla Schedules
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      unitId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'CareUnits', // FK a la tabla CareUnits
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      startTime: {
        type: Sequelize.DATE
      },
      endTime: {
        type: Sequelize.DATE
      },
      reason: {
        type: Sequelize.STRING
      },
      channel: {
        type: Sequelize.ENUM('Presencial', 'Virtual'), 
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Solicitada', 'Confirmada', 'Cumplida', 'Cancelada', 'No asistio'),
        allowNull: false,
        defaultValue: 'Solicitada'
      },
      observations: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Appointments');
  }
};