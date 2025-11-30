'use strict';

/** @type {import('sequelize-cli').Migration} */
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Hash de la contraseña "admin123" (cambiar en producción)
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Crear usuario admin
    const adminUser = {
      username: 'admin',
      email: 'admin@clinica.com',
      passwordHash: passwordHash,
      status: true,
      creationDate: now,
      createdAt: now,
      updatedAt: now,
    };

    await queryInterface.bulkInsert('Users', [adminUser], {});

    // Obtener el ID del usuario admin recién creado
    const insertedAdmin = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE username = 'admin' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (insertedAdmin.length === 0) {
      throw new Error('No se pudo crear el usuario admin');
    }

    const adminUserId = insertedAdmin[0].id;

    // Obtener ID del rol ADMIN
    const adminRole = await queryInterface.sequelize.query(
      `SELECT id FROM Roles WHERE name = 'ADMIN' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (adminRole.length === 0) {
      throw new Error('Rol ADMIN no encontrado. Ejecuta primero el seeder de roles.');
    }

    const adminRoleId = adminRole[0].id;

    // Asignar rol ADMIN al usuario admin
    await queryInterface.bulkInsert('UserRoles', [{
      userId: adminUserId,
      roleId: adminRoleId,
      createdAt: now,
      updatedAt: now,
    }], {});

    console.log('✅ Seeder ejecutado: Usuario admin creado con rol ADMIN');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   ⚠️  IMPORTANTE: Cambia la contraseña en producción!');
  },

  async down(queryInterface, Sequelize) {
    // Obtener ID del usuario admin
    const adminUsers = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE username = 'admin'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (adminUsers.length > 0) {
      const adminUserIds = adminUsers.map(u => u.id);

      // Eliminar asignación de rol
      await queryInterface.bulkDelete('UserRoles', {
        userId: {
          [Sequelize.Op.in]: adminUserIds
        }
      }, {});
    }

    // Eliminar usuario admin
    await queryInterface.bulkDelete('Users', {
      username: 'admin'
    }, {});

    console.log('✅ Rollback ejecutado: Usuario admin eliminado');
  }
};

