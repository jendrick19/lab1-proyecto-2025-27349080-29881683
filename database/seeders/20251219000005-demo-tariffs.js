'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener prestaciones y planes existentes
    const services = await queryInterface.sequelize.query(
      'SELECT code FROM Services ORDER BY code ASC LIMIT 15;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const plans = await queryInterface.sequelize.query(
      'SELECT id FROM Plans ORDER BY id ASC;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (services.length === 0) {
      console.log('No hay prestaciones disponibles para crear aranceles');
      return;
    }

    const tariffs = [];
    const today = new Date();

    // Crear tarifas generales (planId = null) para todas las prestaciones
    services.forEach((service, index) => {
      const effectiveFrom = new Date(today);
      effectiveFrom.setMonth(effectiveFrom.getMonth() - (index % 6));
      
      const effectiveTo = new Date(effectiveFrom);
      effectiveTo.setFullYear(effectiveTo.getFullYear() + 2);

      // Valores base según el tipo de prestación
      let baseValue = 0;
      if (service.code.startsWith('CONS')) {
        baseValue = [50000, 75000, 100000][index % 3];
      } else if (service.code.startsWith('LAB')) {
        baseValue = [15000, 25000, 35000][index % 3];
      } else if (service.code.startsWith('IMG')) {
        baseValue = [80000, 120000, 150000][index % 3];
      } else if (service.code.startsWith('PROC')) {
        baseValue = [100000, 150000, 200000][index % 3];
      } else {
        baseValue = [30000, 50000, 70000][index % 3];
      }

      const taxes = baseValue * 0.19; // IVA 19%

      tariffs.push({
        serviceCode: service.code,
        planId: null, // Tarifa general
        baseValue: baseValue,
        taxes: taxes,
        effectiveFrom: effectiveFrom,
        effectiveTo: effectiveTo,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Crear tarifas específicas para algunos planes (sobrescriben tarifas generales)
    if (plans.length > 0 && services.length >= 5) {
      const selectedServices = services.slice(0, 5);
      const selectedPlans = plans.slice(0, Math.min(3, plans.length));

      selectedServices.forEach((service, serviceIndex) => {
        selectedPlans.forEach((plan, planIndex) => {
          const effectiveFrom = new Date(today);
          effectiveFrom.setMonth(effectiveFrom.getMonth() - 2);
          
          const effectiveTo = new Date(effectiveFrom);
          effectiveTo.setFullYear(effectiveTo.getFullYear() + 1);

          // Tarifas específicas pueden tener descuentos o recargos
          let baseValue = 0;
          if (service.code.startsWith('CONS')) {
            baseValue = [45000, 70000, 95000][serviceIndex % 3];
          } else if (service.code.startsWith('LAB')) {
            baseValue = [12000, 20000, 30000][serviceIndex % 3];
          } else if (service.code.startsWith('IMG')) {
            baseValue = [70000, 110000, 140000][serviceIndex % 3];
          } else if (service.code.startsWith('PROC')) {
            baseValue = [90000, 140000, 190000][serviceIndex % 3];
          } else {
            baseValue = [25000, 45000, 65000][serviceIndex % 3];
          }

          // Aplicar variación según el plan (descuento o recargo)
          const variation = [0.9, 1.0, 1.1][planIndex % 3]; // 10% descuento, normal, 10% recargo
          baseValue = Math.round(baseValue * variation);

          const taxes = baseValue * 0.19;

          tariffs.push({
            serviceCode: service.code,
            planId: plan.id, // Tarifa específica del plan
            baseValue: baseValue,
            taxes: taxes,
            effectiveFrom: effectiveFrom,
            effectiveTo: effectiveTo,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
      });
    }

    // Crear algunas tarifas generales sin fecha de fin (vigentes indefinidamente)
    if (services.length >= 3) {
      const futureDate = new Date(today);
      futureDate.setMonth(futureDate.getMonth() - 1);

      services.slice(0, 3).forEach((service, index) => {
        let baseValue = 50000;
        if (service.code.startsWith('CONS')) {
          baseValue = 60000;
        } else if (service.code.startsWith('LAB')) {
          baseValue = 20000;
        }

        tariffs.push({
          serviceCode: service.code,
          planId: null, // Tarifa general
          baseValue: baseValue,
          taxes: baseValue * 0.19,
          effectiveFrom: futureDate,
          effectiveTo: null, // Sin fecha de fin
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    }

    if (tariffs.length > 0) {
      await queryInterface.bulkInsert('Tariffs', tariffs);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tariffs', null, {});
  }
};

