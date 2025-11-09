'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ClinicalNoteVersions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      noteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'ClinicalNotes', // FK a la tabla ClinicalNotes (PLURAL)
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      versionDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      subjective: {
        type: Sequelize.TEXT
      },
      objective: {
        type: Sequelize.TEXT
      },
      analysis: {
        type: Sequelize.TEXT
      },
      plan: {
        type: Sequelize.TEXT
      },
      attachments: {
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
    await queryInterface.dropTable('ClinicalNoteVersions');
  }
};