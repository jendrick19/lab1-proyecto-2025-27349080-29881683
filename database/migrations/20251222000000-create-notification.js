'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      peopleId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'PeopleAttendeds',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      appointmentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Appointments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      resultId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Results',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      invoiceId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Invoices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      type: {
        type: Sequelize.ENUM('email', 'sms', 'push'),
        allowNull: false,
        defaultValue: 'email'
      },
      recipient: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      template: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      payload: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pendiente', 'enviado', 'error', 'reintentado'),
        allowNull: false,
        defaultValue: 'pendiente'
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      sentDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      nextAttempt: {
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

    await queryInterface.addIndex('Notifications', ['peopleId'], {
      name: 'idx_notifications_people_id'
    });

    await queryInterface.addIndex('Notifications', ['appointmentId'], {
      name: 'idx_notifications_appointment_id'
    });

    await queryInterface.addIndex('Notifications', ['resultId'], {
      name: 'idx_notifications_result_id'
    });

    await queryInterface.addIndex('Notifications', ['invoiceId'], {
      name: 'idx_notifications_invoice_id'
    });

    await queryInterface.addIndex('Notifications', ['type'], {
      name: 'idx_notifications_type'
    });

    await queryInterface.addIndex('Notifications', ['status'], {
      name: 'idx_notifications_status'
    });

    await queryInterface.addIndex('Notifications', ['timestamp'], {
      name: 'idx_notifications_timestamp'
    });

    await queryInterface.addIndex('Notifications', ['nextAttempt'], {
      name: 'idx_notifications_next_attempt'
    });

    await queryInterface.addIndex('Notifications', ['status', 'attempts', 'nextAttempt'], {
      name: 'idx_notifications_retry_queue'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Notifications');
  }
};


