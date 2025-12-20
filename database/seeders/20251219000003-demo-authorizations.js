'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener órdenes y planes existentes
    const orders = await queryInterface.sequelize.query(
      'SELECT id FROM Orders ORDER BY id ASC LIMIT 20;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const plans = await queryInterface.sequelize.query(
      'SELECT id, codigo FROM Plans ORDER BY id ASC;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (orders.length === 0 || plans.length === 0) {
      console.log('No hay órdenes o planes disponibles para crear autorizaciones');
      return;
    }

    const authorizations = [];
    const today = new Date();
    const statuses = ['solicitada', 'aprobada', 'negada'];
    const procedureCodes = ['890101', '890102', '890103', '890201', '890301', '890302'];
    let authorizationCounter = 1;

    // Crear autorizaciones para diferentes órdenes
    orders.forEach((order, index) => {
      const plan = plans[index % plans.length];
      const status = statuses[index % statuses.length];
      const requestDate = new Date(today);
      requestDate.setDate(requestDate.getDate() - (index % 30));
      
      let responseDate = null;
      if (status !== 'solicitada') {
        responseDate = new Date(requestDate);
        responseDate.setDate(responseDate.getDate() + Math.floor(Math.random() * 5) + 1);
      }

      // Generar número de autorización único solo si está aprobada
      let authorizationNumber = null;
      if (status === 'aprobada') {
        authorizationNumber = `AUT-${plan.codigo}-${String(order.id).padStart(4, '0')}-${String(authorizationCounter).padStart(4, '0')}`;
        authorizationCounter++;
      }

      authorizations.push({
        orderId: order.id,
        planId: plan.id,
        procedureCode: procedureCodes[index % procedureCodes.length],
        status: status,
        requestDate: requestDate,
        responseDate: responseDate,
        authorizationNumber: authorizationNumber,
        observations: status === 'negada' ? 'Procedimiento no autorizado según normativa del plan' : null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    if (authorizations.length > 0) {
      await queryInterface.bulkInsert('Authorizations', authorizations);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Authorizations', null, {});
  }
};

