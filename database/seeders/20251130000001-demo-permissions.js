'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const permissions = [
      // Permisos de usuarios
      {
        key: 'users.create',
        description: 'Crear nuevos usuarios',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'users.read',
        description: 'Ver usuarios',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'users.update',
        description: 'Actualizar usuarios',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'users.delete',
        description: 'Eliminar usuarios',
        createdAt: now,
        updatedAt: now,
      },
      // Permisos de roles
      {
        key: 'roles.assign',
        description: 'Asignar roles a usuarios',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'roles.manage',
        description: 'Gestionar roles y permisos',
        createdAt: now,
        updatedAt: now,
      },
      // Permisos de profesionales
      {
        key: 'professionals.create',
        description: 'Crear profesionales',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'professionals.read',
        description: 'Ver profesionales',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'professionals.update',
        description: 'Actualizar profesionales',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'professionals.delete',
        description: 'Eliminar profesionales',
        createdAt: now,
        updatedAt: now,
      },
      // Permisos de citas
      {
        key: 'appointments.create',
        description: 'Crear citas',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'appointments.read',
        description: 'Ver citas',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'appointments.update',
        description: 'Actualizar citas',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'appointments.delete',
        description: 'Eliminar citas',
        createdAt: now,
        updatedAt: now,
      },
      // Permisos de pacientes
      {
        key: 'patients.create',
        description: 'Crear pacientes',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'patients.read',
        description: 'Ver pacientes',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'patients.update',
        description: 'Actualizar pacientes',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'patients.delete',
        description: 'Eliminar pacientes',
        createdAt: now,
        updatedAt: now,
      },
      // Permisos de notas clínicas
      {
        key: 'clinical-notes.create',
        description: 'Crear notas clínicas',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'clinical-notes.read',
        description: 'Ver notas clínicas',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'clinical-notes.update',
        description: 'Actualizar notas clínicas',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'clinical-notes.delete',
        description: 'Eliminar notas clínicas',
        createdAt: now,
        updatedAt: now,
      },
      // Permisos de reportes
      {
        key: 'reports.view',
        description: 'Ver reportes',
        createdAt: now,
        updatedAt: now,
      },
      {
        key: 'reports.export',
        description: 'Exportar reportes',
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert('Permissions', permissions, {});

    console.log('✅ Seeder ejecutado: Permisos creados');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Permissions', {
      key: {
        [Sequelize.Op.like]: '%.%'
      }
    }, {});

    console.log('✅ Rollback ejecutado: Permisos eliminados');
  }
};

