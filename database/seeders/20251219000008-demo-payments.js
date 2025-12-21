'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener facturas válidas (emitida, pendiente, pagada)
    const invoices = await queryInterface.sequelize.query(
      `SELECT id, total, status FROM Invoices 
       WHERE status IN ('emitida', 'pendiente', 'pagada') 
       ORDER BY id ASC;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (invoices.length === 0) {
      console.log('No hay facturas válidas para crear pagos');
      return;
    }

    const payments = [];
    const today = new Date();

    invoices.forEach((invoice, index) => {
      const paymentDate = new Date(today);
      paymentDate.setDate(paymentDate.getDate() - (index * 3));

      // Si la factura está pagada, crear un pago completo
      if (invoice.status === 'pagada') {
        payments.push({
          invoiceId: invoice.id,
          date: paymentDate,
          amount: invoice.total,
          method: index % 3 === 0 ? 'efectivo' : (index % 3 === 1 ? 'tarjeta' : 'transferencia'),
          reference: `REF-${String(1000 + index).padStart(6, '0')}`,
          status: 'completado',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } 
      // Si está pendiente, crear un pago parcial
      else if (invoice.status === 'pendiente') {
        const partialAmount = invoice.total * 0.6; // 60% del total
        payments.push({
          invoiceId: invoice.id,
          date: paymentDate,
          amount: partialAmount,
          method: index % 3 === 0 ? 'efectivo' : (index % 3 === 1 ? 'tarjeta' : 'transferencia'),
          reference: `REF-${String(2000 + index).padStart(6, '0')}`,
          status: 'completado',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      // Si está emitida, crear algunos pagos pendientes o completados
      else if (invoice.status === 'emitida' && index % 2 === 0) {
        const amount = invoice.total * 0.5; // 50% del total
        payments.push({
          invoiceId: invoice.id,
          date: paymentDate,
          amount: amount,
          method: index % 3 === 0 ? 'efectivo' : (index % 3 === 1 ? 'tarjeta' : 'transferencia'),
          reference: `REF-${String(3000 + index).padStart(6, '0')}`,
          status: index % 3 === 0 ? 'completado' : 'pendiente',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    if (payments.length > 0) {
      await queryInterface.bulkInsert('Payments', payments);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Payments', null, {});
  }
};

