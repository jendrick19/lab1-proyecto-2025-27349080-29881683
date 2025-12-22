'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener profesionales existentes
    const professionals = await queryInterface.sequelize.query(
      'SELECT id FROM Profesionals ORDER BY id ASC LIMIT 10;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Obtener unidades de atención existentes
    const careUnits = await queryInterface.sequelize.query(
      'SELECT id FROM CareUnits ORDER BY id ASC LIMIT 10;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (professionals.length === 0) {
      console.log('⚠️  No hay profesionales disponibles para crear agendas');
      return;
    }

    if (careUnits.length === 0) {
      console.log('⚠️  No hay unidades de atención disponibles para crear agendas');
      return;
    }

    const now = new Date();
    const schedules = [];
    const statusOptions = ['abierta', 'reservada', 'cerrada'];
    const capacities = [8, 10, 12, 15, 18, 20, 25, 30];

    for (let i = 0; i < Math.min(professionals.length, careUnits.length, 10); i++) {
      const professional = professionals[i];
      const careUnit = careUnits[i];
      const day = i + 1;
      
      schedules.push({
        professionalId: professional.id,
        unitId: careUnit.id,
        startTime: new Date(`2025-12-${String(day).padStart(2, '0')} ${8 + (i % 2)}:00:00`),
        endTime: new Date(`2025-12-${String(day).padStart(2, '0')} ${14 + (i % 4)}:00:00`),
        capacity: capacities[i % capacities.length],
        status: statusOptions[i % statusOptions.length],
        createdAt: now,
        updatedAt: now,
      });
    }

    if (schedules.length > 0) {
      await queryInterface.bulkInsert('Schedules', schedules, {});
      console.log(`✅ Seeder ejecutado: ${schedules.length} agendas creadas`);
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Schedules', null, {});
    console.log('✅ Rollback ejecutado: Agendas eliminadas');
  }
};
