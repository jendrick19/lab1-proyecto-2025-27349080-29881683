'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Episodes', {
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
            model: 'PeopleAttendeds', // FK a la tabla Patients (tu entidad PersonaAtendida)
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      openingDate: {
        type: Sequelize.DATE
      },
      reason: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.ENUM('Consulta', 'Procedimiento', 'Control', 'Urgencia'), 
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Abierto', 'Cerrado'),
        allowNull: false,
        defaultValue: 'Abierto'
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
    await queryInterface.dropTable('Episodes');
  }
};