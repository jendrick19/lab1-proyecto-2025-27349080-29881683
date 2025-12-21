'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener facturas y servicios existentes
    const invoices = await queryInterface.sequelize.query(
      'SELECT id, status FROM Invoices ORDER BY id ASC;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const services = await queryInterface.sequelize.query(
      'SELECT code FROM Services ORDER BY code ASC;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (invoices.length === 0 || services.length === 0) {
      console.log('No hay facturas o servicios disponibles para crear items');
      return;
    }

    const items = [];
    const servicePrices = {
      'CONS001': { unitValue: 50000, taxes: 9500 },
      'CONS002': { unitValue: 75000, taxes: 14250 },
      'LAB001': { unitValue: 15000, taxes: 2850 },
      'LAB002': { unitValue: 12000, taxes: 2280 },
      'LAB003': { unitValue: 25000, taxes: 4750 },
      'IMG001': { unitValue: 80000, taxes: 15200 },
      'IMG002': { unitValue: 120000, taxes: 22800 },
      'IMG003': { unitValue: 200000, taxes: 38000 },
      'PROC001': { unitValue: 30000, taxes: 5700 },
      'PROC002': { unitValue: 45000, taxes: 8550 },
      'PROC003': { unitValue: 150000, taxes: 28500 },
      'PROC004': { unitValue: 180000, taxes: 34200 },
      'URG001': { unitValue: 100000, taxes: 19000 },
      'TER001': { unitValue: 40000, taxes: 7600 },
      'TER002': { unitValue: 35000, taxes: 6650 },
    };

    // Crear items para cada factura
    invoices.forEach((invoice, invoiceIndex) => {
      // Cada factura tiene entre 1 y 4 items
      const numItems = (invoiceIndex % 4) + 1;
      
      for (let j = 0; j < numItems; j++) {
        const serviceIndex = (invoiceIndex * numItems + j) % services.length;
        const serviceCode = services[serviceIndex].code;
        const priceInfo = servicePrices[serviceCode] || { unitValue: 50000, taxes: 9500 };
        
        const quantity = (j % 2) + 1; // Cantidad 1 o 2
        const unitValue = priceInfo.unitValue;
        const itemTaxes = priceInfo.taxes * quantity;
        const itemSubTotal = unitValue * quantity;
        const itemTotal = itemSubTotal + itemTaxes;

        items.push({
          invoiceId: invoice.id,
          serviceCode: serviceCode,
          description: `Item ${j + 1} de factura ${invoice.id}`,
          quantity: quantity,
          unitValue: unitValue,
          taxes: itemTaxes,
          total: itemTotal,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    if (items.length > 0) {
      await queryInterface.bulkInsert('InvoiceItems', items);

      // Actualizar totales de facturas desde los items
      for (const invoice of invoices) {
        const invoiceItems = await queryInterface.sequelize.query(
          `SELECT SUM(quantity * unitValue) as subTotal, SUM(taxes) as taxes, SUM(total) as total 
           FROM InvoiceItems WHERE invoiceId = ${invoice.id};`,
          { type: Sequelize.QueryTypes.SELECT }
        );

        if (invoiceItems[0] && invoiceItems[0].subTotal) {
          await queryInterface.sequelize.query(
            `UPDATE Invoices 
             SET subTotal = ${invoiceItems[0].subTotal}, 
                 taxes = ${invoiceItems[0].taxes}, 
                 total = ${invoiceItems[0].total}
             WHERE id = ${invoice.id};`
          );
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('InvoiceItems', null, {});
  }
};

