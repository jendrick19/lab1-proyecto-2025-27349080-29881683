'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Affiliations', {
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
      policyNumber: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      effectiveFrom: {
        type: Sequelize.DATE,
        allowNull: false
      },
      effectiveTo: {
        type: Sequelize.DATE,
        allowNull: true
      },
      copayment: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
      },
      moderationFee: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.addIndex('Affiliations', ['peopleId'], {
      name: 'idx_affiliations_people_id'
    });
    
    await queryInterface.addIndex('Affiliations', ['planId'], {
      name: 'idx_affiliations_plan_id'
    });
    
    // El índice único ya se crea automáticamente con unique: true en el campo policyNumber

    await queryInterface.addIndex('Affiliations', ['effectiveFrom'], {
      name: 'idx_affiliations_effective_from'
    });

    await queryInterface.addIndex('Affiliations', ['status'], {
      name: 'idx_affiliations_status'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Affiliations');
  }
};

