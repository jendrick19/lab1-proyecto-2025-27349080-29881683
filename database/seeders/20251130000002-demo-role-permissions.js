'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Obtener IDs de roles
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM Roles ORDER BY name`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.name] = role.id;
    });

    // Obtener IDs de permisos
    const permissions = await queryInterface.sequelize.query(
      `SELECT id, \`key\` FROM Permissions ORDER BY \`key\``,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const permissionMap = {};
    permissions.forEach(perm => {
      permissionMap[perm.key] = perm.id;
    });

    const rolePermissions = [];

    // ADMIN: Todos los permisos
    if (roleMap['ADMIN']) {
      Object.values(permissionMap).forEach(permissionId => {
        rolePermissions.push({
          roleId: roleMap['ADMIN'],
          permissionId: permissionId,
          createdAt: now,
          updatedAt: now,
        });
      });
    }

    // PROFESSIONAL: Permisos relacionados con su trabajo
    if (roleMap['PROFESSIONAL']) {
      const professionalPermissions = [
        'appointments.read',
        'appointments.update',
        'patients.read',
        'clinical-notes.create',
        'clinical-notes.read',
        'clinical-notes.update',
        'reports.view',
      ];

      professionalPermissions.forEach(key => {
        if (permissionMap[key]) {
          rolePermissions.push({
            roleId: roleMap['PROFESSIONAL'],
            permissionId: permissionMap[key],
            createdAt: now,
            updatedAt: now,
          });
        }
      });
    }

    // RECEPTIONIST: Permisos de recepción
    if (roleMap['RECEPTIONIST']) {
      const receptionistPermissions = [
        'appointments.create',
        'appointments.read',
        'appointments.update',
        'patients.create',
        'patients.read',
        'patients.update',
        'professionals.read',
      ];

      receptionistPermissions.forEach(key => {
        if (permissionMap[key]) {
          rolePermissions.push({
            roleId: roleMap['RECEPTIONIST'],
            permissionId: permissionMap[key],
            createdAt: now,
            updatedAt: now,
          });
        }
      });
    }

    // NURSE: Permisos de enfermería
    if (roleMap['NURSE']) {
      const nursePermissions = [
        'patients.read',
        'patients.update',
        'clinical-notes.read',
        'appointments.read',
      ];

      nursePermissions.forEach(key => {
        if (permissionMap[key]) {
          rolePermissions.push({
            roleId: roleMap['NURSE'],
            permissionId: permissionMap[key],
            createdAt: now,
            updatedAt: now,
          });
        }
      });
    }

    if (rolePermissions.length > 0) {
      await queryInterface.bulkInsert('RolePermissions', rolePermissions, {});
    }

    console.log('✅ Seeder ejecutado: Permisos asignados a roles');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('RolePermissions', null, {});

    console.log('✅ Rollback ejecutado: Asignaciones de permisos eliminadas');
  }
};

