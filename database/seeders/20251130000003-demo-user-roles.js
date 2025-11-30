'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Obtener ID del rol PROFESSIONAL
    const professionalRole = await queryInterface.sequelize.query(
      `SELECT id FROM Roles WHERE name = 'PROFESSIONAL' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (professionalRole.length === 0) {
      throw new Error('Rol PROFESSIONAL no encontrado. Ejecuta primero el seeder de roles.');
    }

    const professionalRoleId = professionalRole[0].id;

    // Obtener todos los usuarios que tienen un Professional asociado (los 20 del seeder)
    const usersWithProfessionals = await queryInterface.sequelize.query(
      `SELECT DISTINCT u.id 
       FROM Users u
       INNER JOIN Profesionals p ON p.userId = u.id
       WHERE u.email LIKE '%@hospital.com'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Asignar rol PROFESSIONAL a todos los usuarios que son profesionales
    const userRoles = usersWithProfessionals.map(user => ({
      userId: user.id,
      roleId: professionalRoleId,
      createdAt: now,
      updatedAt: now,
    }));

    if (userRoles.length > 0) {
      await queryInterface.bulkInsert('UserRoles', userRoles, {});
      console.log(`✅ Seeder ejecutado: Rol PROFESSIONAL asignado a ${userRoles.length} usuarios`);
    } else {
      console.log('⚠️  No se encontraron usuarios profesionales para asignar roles');
    }
  },

  async down(queryInterface, Sequelize) {
    // Obtener ID del rol PROFESSIONAL
    const professionalRole = await queryInterface.sequelize.query(
      `SELECT id FROM Roles WHERE name = 'PROFESSIONAL' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (professionalRole.length > 0) {
      const professionalRoleId = professionalRole[0].id;

      // Obtener IDs de usuarios con email @hospital.com
      const users = await queryInterface.sequelize.query(
        `SELECT id FROM Users WHERE email LIKE '%@hospital.com'`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      const userIds = users.map(u => u.id);

      if (userIds.length > 0) {
        await queryInterface.bulkDelete('UserRoles', {
          userId: {
            [Sequelize.Op.in]: userIds
          },
          roleId: professionalRoleId
        }, {});
      }
    }

    console.log('✅ Rollback ejecutado: Asignaciones de roles eliminadas');
  }
};

