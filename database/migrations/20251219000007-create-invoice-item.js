'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('InvoiceItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invoiceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Invoices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      serviceCode: {
        type: Sequelize.STRING(50),
        allowNull: false,
        references: {
          model: 'Services',
          key: 'code'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      unitValue: {
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
    await queryInterface.addIndex('InvoiceItems', ['invoiceId'], {
      name: 'idx_invoice_items_invoice_id'
    });
    
    await queryInterface.addIndex('InvoiceItems', ['serviceCode'], {
      name: 'idx_invoice_items_service_code'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('InvoiceItems');
  }
};

