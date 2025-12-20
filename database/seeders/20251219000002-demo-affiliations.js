'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener personas y planes existentes
    const people = await queryInterface.sequelize.query(
      'SELECT id FROM PeopleAttendeds ORDER BY id ASC LIMIT 10;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const plans = await queryInterface.sequelize.query(
      'SELECT id, codigo FROM Plans ORDER BY id ASC;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (people.length === 0 || plans.length === 0) {
      console.log('No hay personas o planes disponibles para crear afiliaciones');
      return;
    }

    const affiliations = [];
    const today = new Date();

    // Crear afiliaciones para diferentes personas
    people.forEach((person, index) => {
      const plan = plans[index % plans.length];
      const effectiveFrom = new Date(today);
      effectiveFrom.setMonth(effectiveFrom.getMonth() - (index % 12));
      
      const effectiveTo = new Date(effectiveFrom);
      effectiveTo.setFullYear(effectiveTo.getFullYear() + 1);

      // Generar número de póliza único
      const policyNumber = `POL-${plan.codigo}-${String(person.id).padStart(4, '0')}-${String(index + 1).padStart(3, '0')}`;

      affiliations.push({
        peopleId: person.id,
        planId: plan.id,
        policyNumber: policyNumber,
        effectiveFrom: effectiveFrom,
        effectiveTo: effectiveTo,
        copayment: [0, 10, 15, 20][index % 4],
        moderationFee: [0, 5000, 10000, 15000][index % 4],
        status: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Crear algunas afiliaciones históricas (ya vencidas)
    if (people.length >= 3 && plans.length >= 2) {
      const pastDate = new Date(today);
      pastDate.setFullYear(pastDate.getFullYear() - 2);
      const pastEndDate = new Date(pastDate);
      pastEndDate.setFullYear(pastEndDate.getFullYear() + 1);

      affiliations.push({
        peopleId: people[0].id,
        planId: plans[0].id,
        policyNumber: `POL-${plans[0].codigo}-${String(people[0].id).padStart(4, '0')}-HIST-001`,
        effectiveFrom: pastDate,
        effectiveTo: pastEndDate,
        copayment: 20,
        moderationFee: 10000,
        status: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Crear algunas afiliaciones vigentes sin fecha de fin
    if (people.length >= 5) {
      const futureDate = new Date(today);
      futureDate.setMonth(futureDate.getMonth() - 6);

      affiliations.push({
        peopleId: people[4].id,
        planId: plans[0].id,
        policyNumber: `POL-${plans[0].codigo}-${String(people[4].id).padStart(4, '0')}-ACT-001`,
        effectiveFrom: futureDate,
        effectiveTo: null,
        copayment: 15,
        moderationFee: 8000,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    if (affiliations.length > 0) {
      await queryInterface.bulkInsert('Affiliations', affiliations);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Affiliations', null, {});
  }
};

