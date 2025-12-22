'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Authorizations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      planId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Plans',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      procedureCode: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('solicitada', 'aprobada', 'negada'),
        allowNull: false,
        defaultValue: 'solicitada'
      },
      requestDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      responseDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      authorizationNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      observations: {
        type: Sequelize.STRING(1000),
        allowNull: true
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

    // Índices para optimizar búsquedas
    await queryInterface.addIndex('Authorizations', ['orderId'], {
      name: 'idx_authorizations_order_id'
    });
    
    await queryInterface.addIndex('Authorizations', ['planId'], {
      name: 'idx_authorizations_plan_id'
    });

    await queryInterface.addIndex('Authorizations', ['status'], {
      name: 'idx_authorizations_status'
    });

    await queryInterface.addIndex('Authorizations', ['requestDate'], {
      name: 'idx_authorizations_request_date'
    });

    await queryInterface.addIndex('Authorizations', ['responseDate'], {
      name: 'idx_authorizations_response_date'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Authorizations');
  }
};

