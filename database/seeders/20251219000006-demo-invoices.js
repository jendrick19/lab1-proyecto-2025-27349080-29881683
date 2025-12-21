'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener datos existentes
    const people = await queryInterface.sequelize.query(
      'SELECT id FROM PeopleAttendeds WHERE status = 1 ORDER BY id ASC LIMIT 10;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const insurers = await queryInterface.sequelize.query(
      'SELECT id FROM Insurers WHERE estado = "activo" ORDER BY id ASC;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (people.length === 0 || insurers.length === 0) {
      console.log('No hay personas o aseguradoras disponibles para crear facturas');
      return;
    }

    const invoices = [];
    const today = new Date();

    // Crear facturas de ejemplo
    for (let i = 0; i < Math.min(10, people.length); i++) {
      const issueDate = new Date(today);
      issueDate.setDate(issueDate.getDate() - (i * 5)); // Facturas con fechas diferentes

      const invoiceNumber = `FAC-${String(1000 + i).padStart(6, '0')}`;
      
      // Establecer estado según el índice
      let status = 'emitida';
      if (i % 4 === 0) status = 'emitida';
      else if (i % 4 === 1) status = 'pendiente';
      else if (i % 4 === 2) status = 'pagada';
      else status = 'emitida';

      invoices.push({
        number: invoiceNumber,
        issueDate: issueDate,
        peopleId: people[i].id,
        insurerId: insurers[i % insurers.length].id,
        currency: i % 3 === 0 ? 'VES' : (i % 3 === 1 ? 'USD' : 'EUR'),
        subTotal: 0, // Se calculará después desde items
        taxes: 0,
        total: 0,
        status: status,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    if (invoices.length > 0) {
      await queryInterface.bulkInsert('Invoices', invoices);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Invoices', null, {});
  }
};

