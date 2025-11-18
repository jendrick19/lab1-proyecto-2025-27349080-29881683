'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Arrays de datos para generar profesionales variados
    const nombres = [
      'Juan', 'María', 'Carlos', 'Ana', 'Luis',
      'Carmen', 'Pedro', 'Laura', 'Miguel', 'Isabel',
      'José', 'Elena', 'Antonio', 'Rosa', 'Francisco',
      'Marta', 'David', 'Patricia', 'Rafael', 'Lucía'
    ];

    const apellidos = [
      'García Pérez', 'Rodríguez López', 'Martínez González', 'Fernández Sánchez', 'López Díaz',
      'González Martín', 'Sánchez Ruiz', 'Pérez Jiménez', 'Martín Hernández', 'Gómez Moreno',
      'Jiménez Álvarez', 'Ruiz Romero', 'Hernández Torres', 'Díaz Navarro', 'Moreno Domínguez',
      'Álvarez Gil', 'Romero Vázquez', 'Torres Serrano', 'Navarro Ramos', 'Domínguez Castro'
    ];

    const especialidades = [
      'Cardiología', 'Pediatría', 'Traumatología', 'Dermatología', 'Neurología',
      'Oftalmología', 'Ginecología', 'Psiquiatría', 'Medicina General', 'Odontología',
      'Cardiología', 'Pediatría', 'Traumatología', 'Dermatología', 'Neurología',
      'Oftalmología', 'Ginecología', 'Psiquiatría', 'Medicina General', 'Odontología'
    ];

    // Generar 20 usuarios
    const users = [];
    for (let i = 1; i <= 20; i++) {
      const nombre = nombres[i - 1];
      const apellido = apellidos[i - 1].split(' ')[0].toLowerCase();
      
      users.push({
        username: `${nombre.toLowerCase()}${apellido}${i}`,
        email: `${nombre.toLowerCase()}.${apellido}${i}@hospital.com`,
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ',
        status: true,
        creationDate: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Insertar usuarios primero
    await queryInterface.bulkInsert('Users', users, {});

    // Obtener los IDs de los usuarios recién creados
    const insertedUsers = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE email LIKE '%@hospital.com' ORDER BY id DESC LIMIT 20`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    // Invertir el array para que coincida con el orden de creación
    insertedUsers.reverse();

    // Verificar que se obtuvieron los usuarios
    if (insertedUsers.length !== 20) {
      throw new Error(`Se esperaban 20 usuarios pero se obtuvieron ${insertedUsers.length}`);
    }

    // Generar 20 profesionales asociados a los usuarios
    const professionals = [];
    for (let i = 0; i < 20; i++) {
      const nombre = nombres[i];
      const apellido = apellidos[i];
      const especialidad = especialidades[i];
      const userId = insertedUsers[i].id;

      professionals.push({
        userId: userId,
        names: nombre,
        surNames: apellido,
        professionalRegister: `MP-${String(i + 1).padStart(5, '0')}`, // MP-00001 a MP-00020
        specialty: especialidad,
        email: `${nombre.toLowerCase()}.${apellido.split(' ')[0].toLowerCase()}${i + 1}@hospital.com`,
        phone: `+58412${String(1000000 + i).substring(1)}`, // Teléfonos venezolanos de ejemplo
        scheduleEnabled: i % 3 !== 0, // 2 de cada 3 tienen agenda habilitada
        status: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Insertar profesionales
    await queryInterface.bulkInsert('Profesionals', professionals, {});

    console.log('✅ Seeder ejecutado: 20 usuarios y 20 profesionales creados');
  },

  async down(queryInterface, Sequelize) {
    // Eliminar profesionales primero (por la clave foránea)
    await queryInterface.bulkDelete('Profesionals', {
      professionalRegister: {
        [Sequelize.Op.like]: 'MP-%'
      }
    }, {});

    // Eliminar usuarios
    await queryInterface.bulkDelete('Users', {
      email: {
        [Sequelize.Op.like]: '%@hospital.com'
      }
    }, {});

    console.log('✅ Rollback ejecutado: Profesionales y usuarios eliminados');
  }
};

