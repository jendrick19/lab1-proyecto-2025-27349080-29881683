'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const people = await queryInterface.sequelize.query(
      'SELECT id, names, surNames, email FROM PeopleAttendeds ORDER BY id ASC LIMIT 50;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const appointments = await queryInterface.sequelize.query(
      'SELECT id, peopleId FROM Appointments ORDER BY id ASC LIMIT 30;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const invoices = await queryInterface.sequelize.query(
      'SELECT id, peopleId FROM Invoices ORDER BY id ASC LIMIT 20;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (people.length === 0) {
      console.log('⚠️  No hay personas disponibles para crear notificaciones');
      return;
    }

    const now = new Date();
    const templates = ['cita_confirmacion', 'cita_recordatorio', 'resultado_disponible', 'factura_emitida'];
    const statuses = ['enviado', 'pendiente', 'error'];
    const notifications = [];

    for (let i = 0; i < 100; i++) {
      const person = people[i % people.length];
      const template = templates[i % templates.length];
      const status = statuses[i % statuses.length];
      
      let appointmentId = null;
      let resultId = null;
      let invoiceId = null;
      let payload = {};

      if (template === 'cita_confirmacion' || template === 'cita_recordatorio') {
        if (appointments.length > 0) {
          const appointment = appointments[i % appointments.length];
          appointmentId = appointment.id;
        }
        payload = {
          nombrePaciente: `${person.names} ${person.surNames}`,
          nombreProfesional: 'Dr. García López',
          fecha: new Date(now.getTime() + (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          hora: `${(8 + (i % 8))}:00 AM`,
          unidad: 'Consulta Externa',
          modalidad: i % 2 === 0 ? 'Presencial' : 'Virtual'
        };
      } else if (template === 'resultado_disponible') {
        payload = {
          nombrePaciente: `${person.names} ${person.surNames}`,
          tipoExamen: ['Hemograma completo', 'Radiografía de tórax', 'Ecografía abdominal', 'Electrocardiograma'][i % 4],
          fechaExamen: new Date(now.getTime() - (i * 12 * 60 * 60 * 1000)).toISOString().split('T')[0]
        };
      } else if (template === 'factura_emitida') {
        if (invoices.length > 0) {
          const invoice = invoices[i % invoices.length];
          invoiceId = invoice.id;
        }
        payload = {
          nombrePaciente: `${person.names} ${person.surNames}`,
          numeroFactura: `FAC-2024-${String(1000 + i).padStart(6, '0')}`,
          fecha: new Date(now.getTime() - (i * 6 * 60 * 60 * 1000)).toISOString().split('T')[0],
          moneda: 'USD',
          total: (50 + (i * 10)).toFixed(2),
          estado: 'Pendiente'
        };
      }

      let recipient = person.email || `paciente${i}@example.com`;
      let subject = null;
      
      if (template === 'cita_confirmacion') {
        subject = 'Confirmación de su cita médica';
      } else if (template === 'cita_recordatorio') {
        subject = 'Recordatorio: Cita médica mañana';
      } else if (template === 'resultado_disponible') {
        subject = 'Sus resultados médicos están disponibles';
      } else if (template === 'factura_emitida') {
        subject = 'Factura emitida';
      }

      const attempts = status === 'error' ? Math.min(i % 5, 3) : (status === 'enviado' ? 1 : 0);
      const sentDate = status === 'enviado' ? new Date(now.getTime() - (i * 60 * 60 * 1000)) : null;
      const nextAttempt = status === 'error' && attempts < 5 
        ? new Date(now.getTime() + (Math.pow(2, attempts) * 5 * 60 * 1000)) 
        : null;

      const errorMessages = [
        'Connection timeout',
        'Invalid email address',
        'SMTP server not responding',
        'Authentication failed',
        'Recipient mailbox full'
      ];

      const errorMessage = status === 'error' ? errorMessages[i % errorMessages.length] : null;

      const metadata = status === 'enviado' ? JSON.stringify({
        messageId: `<${Date.now()}-${i}@clinica.com>`,
        response: '250 Message accepted',
        accepted: [recipient],
        rejected: [],
        sentAt: sentDate ? sentDate.toISOString() : null
      }) : null;

      notifications.push({
        peopleId: person.id,
        appointmentId,
        resultId,
        invoiceId,
        type: 'email',
        recipient,
        template,
        subject,
        payload: JSON.stringify(payload),
        status,
        attempts,
        errorMessage,
        metadata,
        timestamp: new Date(now.getTime() - (i * 30 * 60 * 1000)),
        sentDate,
        nextAttempt,
        createdAt: new Date(now.getTime() - (i * 30 * 60 * 1000)),
        updatedAt: new Date(now.getTime() - (i * 15 * 60 * 1000))
      });
    }

    await queryInterface.bulkInsert('Notifications', notifications, {});
    console.log(`✅ ${notifications.length} notificaciones insertadas correctamente`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Notifications', null, {});
    console.log('✅ Notificaciones eliminadas correctamente');
  }
};

