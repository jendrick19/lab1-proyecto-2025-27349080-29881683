'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Services', {
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      group: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      requirements: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      estimatedTime: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      requiresAuthorization: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.addIndex('Services', ['name'], {
      name: 'idx_services_name'
    });
    
    await queryInterface.addIndex('Services', ['group'], {
      name: 'idx_services_group'
    });

    await queryInterface.addIndex('Services', ['requiresAuthorization'], {
      name: 'idx_services_requires_authorization'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Services');
  }
};

