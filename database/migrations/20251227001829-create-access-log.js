'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AccessLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      recurso: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Endpoint o recurso accedido (ej: /api/appointments)'
      },
      accion: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Método HTTP (GET, POST, PUT, DELETE, etc.)'
      },
      ip: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Dirección IP del cliente'
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User Agent del navegador o cliente'
      },
      statusCode: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Código de respuesta HTTP'
      },
      responseTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Tiempo de respuesta en milisegundos'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Índices para mejorar el rendimiento de consultas
    await queryInterface.addIndex('AccessLogs', ['userId']);
    await queryInterface.addIndex('AccessLogs', ['createdAt']);
    await queryInterface.addIndex('AccessLogs', ['recurso']);
    await queryInterface.addIndex('AccessLogs', ['accion']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AccessLogs');
  }
};
