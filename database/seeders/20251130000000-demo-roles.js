'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const roles = [
      {
        name: 'ADMIN',
        description: 'Administrador del sistema con acceso completo',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'PROFESSIONAL',
        description: 'Profesional de la salud (médicos, especialistas)',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'RECEPTIONIST',
        description: 'Personal de recepción y atención al paciente',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'NURSE',
        description: 'Enfermeras y personal de enfermería',
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert('Roles', roles, {});

    console.log('✅ Seeder ejecutado: Roles creados');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', {
      name: {
        [Sequelize.Op.in]: ['ADMIN', 'PROFESSIONAL', 'RECEPTIONIST', 'NURSE']
      }
    }, {});

    console.log('✅ Rollback ejecutado: Roles eliminados');
  }
};

