'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Invoices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      issueDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      peopleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PeopleAttendeds',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      insurerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Insurers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      currency: {
        type: Sequelize.ENUM('VES', 'USD', 'EUR'),
        allowNull: false,
        defaultValue: 'VES'
      },
      subTotal: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      taxes: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      total: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('emitida', 'pagada', 'pendiente', 'anulada'),
        allowNull: false,
        defaultValue: 'emitida'
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
    await queryInterface.addIndex('Invoices', ['number'], {
      name: 'idx_invoices_number',
      unique: true
    });
    
    await queryInterface.addIndex('Invoices', ['peopleId'], {
      name: 'idx_invoices_people_id'
    });

    await queryInterface.addIndex('Invoices', ['insurerId'], {
      name: 'idx_invoices_insurer_id'
    });

    await queryInterface.addIndex('Invoices', ['status'], {
      name: 'idx_invoices_status'
    });

    await queryInterface.addIndex('Invoices', ['issueDate'], {
      name: 'idx_invoices_issue_date'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Invoices');
  }
};

