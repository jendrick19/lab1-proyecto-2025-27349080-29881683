'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Obtener personas existentes
    const people = await queryInterface.sequelize.query(
      `SELECT id, names, surNames, documentId FROM PeopleAttendeds ORDER BY id ASC`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (people.length === 0) {
      throw new Error('No hay personas disponibles. Ejecuta primero el seeder de personas.');
    }

    // Tipos de procedimientos comunes
    const procedureTypes = [
      'Cirugía menor ambulatoria',
      'Examen de laboratorio',
      'Estudio de imagenología',
      'Procedimiento diagnóstico invasivo',
      'Biopsia',
      'Endoscopia',
      'Colonoscopia',
      'Resonancia magnética',
      'Tomografía computarizada',
      'Electrocardiograma',
      'Ecocardiograma',
      'Prueba de esfuerzo',
      'Extracción de sangre',
      'Aplicación de medicamento intramuscular',
      'Curación de herida',
      'Retiro de puntos',
      'Vacunación',
      'Terapia física',
      'Procedimiento odontológico',
      'Cirugía programada',
    ];

    // Métodos de consentimiento (según el ENUM)
    const methods = ['Firma digital', 'Aceptación verbal con registro'];

    const consents = [];

    // Generar consentimientos para cada persona
    for (const person of people) {
      // Cantidad aleatoria de consentimientos por persona (1 a 4)
      const numConsentimientos = Math.floor(Math.random() * 4) + 1;
      
      // Seleccionar procedimientos aleatorios sin repetir para esta persona
      const procedimientosSeleccionados = [];
      const indicesUsados = new Set();
      
      while (procedimientosSeleccionados.length < numConsentimientos) {
        const index = Math.floor(Math.random() * procedureTypes.length);
        if (!indicesUsados.has(index)) {
          indicesUsados.add(index);
          procedimientosSeleccionados.push(procedureTypes[index]);
        }
      }

      // Crear los consentimientos
      for (let j = 0; j < procedimientosSeleccionados.length; j++) {
        // Calcular fecha del consentimiento (últimos 6 meses)
        const diasAtras = Math.floor(Math.random() * 180); // 0 a 180 días atrás
        const fechaConsentimiento = new Date(now);
        fechaConsentimiento.setDate(fechaConsentimiento.getDate() - diasAtras);
        
        // Seleccionar método aleatorio
        const method = methods[Math.floor(Math.random() * methods.length)];
        
        // Algunos consentimientos tendrán fileId (simulado)
        const fileId = Math.random() > 0.5 ? Math.floor(Math.random() * 1000) + 1 : null;

        consents.push({
          peopleId: person.id,
          procedureType: procedimientosSeleccionados[j],
          consentDate: fechaConsentimiento,
          method: method,
          fileId: fileId,
          createdAt: fechaConsentimiento,
          updatedAt: fechaConsentimiento
        });
      }
    }

    // Insertar todos los consentimientos
    await queryInterface.bulkInsert('Consents', consents, {});

    console.log('✅ Seeder de consentimientos ejecutado exitosamente:');
    console.log(`   - ${consents.length} consentimientos creados`);
    console.log(`   - ${people.length} personas con consentimientos`);
    
    // Estadísticas
    const firmaDigital = consents.filter(c => c.method === 'Firma digital').length;
    const aceptacionVerbal = consents.filter(c => c.method === 'Aceptación verbal con registro').length;
    const conArchivo = consents.filter(c => c.fileId !== null).length;
    
    console.log(`   - ${firmaDigital} con firma digital`);
    console.log(`   - ${aceptacionVerbal} con aceptación verbal con registro`);
    console.log(`   - ${conArchivo} con archivo adjunto`);
    console.log(`   - Procedimientos únicos: ${new Set(consents.map(c => c.procedureType)).size}`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Consents', null, {});
    console.log('✅ Rollback ejecutado: Consentimientos eliminados');
  }
};

