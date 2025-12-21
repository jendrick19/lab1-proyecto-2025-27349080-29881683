'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tariffs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      serviceCode: {
        type: Sequelize.STRING(50),
        allowNull: false,
        references: {
          model: 'Services',
          key: 'code'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      planId: {
        type: Sequelize.INTEGER,
        allowNull: true, // Nullable para tarifa general
        references: {
          model: 'Plans',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      baseValue: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      taxes: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      effectiveFrom: {
        type: Sequelize.DATE,
        allowNull: false
      },
      effectiveTo: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('Tariffs', ['serviceCode'], {
      name: 'idx_tariffs_service_code'
    });
    
    await queryInterface.addIndex('Tariffs', ['planId'], {
      name: 'idx_tariffs_plan_id'
    });

    await queryInterface.addIndex('Tariffs', ['effectiveFrom'], {
      name: 'idx_tariffs_effective_from'
    });

    await queryInterface.addIndex('Tariffs', ['effectiveTo'], {
      name: 'idx_tariffs_effective_to'
    });

    // Índice compuesto para búsquedas de tarifas activas
    await queryInterface.addIndex('Tariffs', ['serviceCode', 'planId', 'effectiveFrom'], {
      name: 'idx_tariffs_service_plan_from'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tariffs');
  }
};

