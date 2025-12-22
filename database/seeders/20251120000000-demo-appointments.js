'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener personas existentes
    const people = await queryInterface.sequelize.query(
      'SELECT id FROM PeopleAttendeds ORDER BY id ASC LIMIT 50;',
      { type: Sequelize.QueryTypes.SELECT }
    );

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

    // Obtener agendas existentes
    const schedules = await queryInterface.sequelize.query(
      'SELECT id FROM Schedules ORDER BY id ASC LIMIT 10;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (people.length === 0) {
      console.log('⚠️  No hay personas disponibles para crear citas');
      return;
    }

    if (professionals.length === 0) {
      console.log('⚠️  No hay profesionales disponibles para crear citas');
      return;
    }

    if (careUnits.length === 0) {
      console.log('⚠️  No hay unidades de atención disponibles para crear citas');
      return;
    }

    const now = new Date();
    const motivos = [
      'Consulta general de control',
      'Dolor abdominal persistente',
      'Control de presión arterial',
      'Revisión de exámenes de laboratorio',
      'Dolor de cabeza frecuente',
      'Control post-operatorio',
      'Evaluación dermatológica',
      'Chequeo cardiológico',
      'Consulta pediátrica de rutina',
      'Dolor en articulaciones',
      'Control de diabetes',
      'Evaluación neurológica',
      'Consulta oftalmológica',
      'Control prenatal',
      'Revisión odontológica',
      'Dolor de espalda crónico',
      'Evaluación nutricional',
      'Control de asma',
      'Consulta de traumatología',
      'Chequeo anual preventivo'
    ];
    const observaciones = [
      'Paciente en ayunas',
      'Traer exámenes previos',
      'Primera consulta',
      'Paciente requiere atención urgente',
      'Traer radiografías',
      null,
      'Paciente con movilidad reducida',
      'Consulta de seguimiento',
      null,
      'Paciente alérgico a penicilina',
      'Traer historia clínica',
      null,
      'Paciente embarazada - segundo trimestre',
      'Requiere acompañante',
      null,
      'Consulta por referencia',
      'Paciente pediátrico',
      null,
      'Traer carnet de vacunación',
      'Consulta prioritaria'
    ];
    const canales = ['Presencial', 'Virtual'];
    const estados = ['Solicitada', 'Confirmada', 'Cumplida', 'Cancelada', 'No asistio'];
    const appointments = [];
    const generarFecha = (diasDesdeHoy) => {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + diasDesdeHoy);
      return fecha;
    };
    const generarHorario = (fecha, horaInicio) => {
      const start = new Date(fecha);
      start.setHours(horaInicio, 0, 0, 0);
      const end = new Date(start);
      end.setMinutes(start.getMinutes() + 30); 
      return { start, end };
    };
    const randomItem = (array) => array[Math.floor(Math.random() * array.length)];
    for (let i = 0; i < 30; i++) {
      let diasOffset;
      let estado;
      if (i < 10) {
        diasOffset = -30 + i * 2;
        estado = randomItem(['Cumplida', 'Cancelada', 'No asistio']);
      } else if (i < 20) {
        diasOffset = i - 10;
        estado = randomItem(['Solicitada', 'Confirmada']);
      } else {
        diasOffset = 5 + (i - 20) * 2;
        estado = randomItem(['Solicitada', 'Confirmada']);
      }
      const fechaCita = generarFecha(diasOffset);
      const hora = 8 + (i % 8); 
      const { start, end } = generarHorario(fechaCita, hora);
      const person = people[i % people.length];
      const professional = professionals[i % professionals.length];
      const careUnit = careUnits[i % careUnits.length];
      const schedule = schedules.length > 0 ? schedules[i % schedules.length] : null;
      const peopleId = person.id;
      const professionalId = professional.id;
      const unitId = careUnit.id;
      const scheduleId = schedule ? schedule.id : null;
      appointments.push({
        peopleId,
        professionalId,
        unitId,
        scheduleId: scheduleId && Math.random() > 0.3 ? scheduleId : null, 
        startTime: start,
        endTime: end,
        channel: randomItem(canales),
        status: estado,
        reason: motivos[i % motivos.length],
        observations: observaciones[i % observaciones.length],
        createdAt: new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000), 
        updatedAt: now
      });
    }
    await queryInterface.bulkInsert('Appointments', appointments, {});
    console.log('✅ Seeder ejecutado: 30 citas creadas');

    // Obtener los IDs reales de las citas recién insertadas
    // Ordenamos por startTime ASC para mantener el orden en que las creamos
    const insertedAppointments = await queryInterface.sequelize.query(
      'SELECT id, startTime FROM Appointments ORDER BY createdAt DESC, startTime ASC LIMIT 30;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (insertedAppointments.length === 0 || insertedAppointments.length < 30) {
      console.log('⚠️  No se pudieron obtener los IDs de las citas insertadas correctamente');
      return;
    }

    // Ordenar por startTime para mantener el orden y mapear los índices originales a los IDs reales
    insertedAppointments.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const appointmentIds = insertedAppointments.map(a => a.id);

    const appointmentHistories = [
      {
        appointmentId: appointmentIds[0], // Primera cita (índice 0)
        oldStatus: 'Solicitada',
        newStatus: 'Confirmada',
        oldStartTime: null,
        newStartTime: null,
        oldEndTime: null,
        newEndTime: null,
        changeReason: 'Confirmación del paciente vía telefónica',
        changedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), 
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        appointmentId: appointmentIds[0], // Primera cita (índice 0)
        oldStatus: 'Confirmada',
        newStatus: 'Cumplida',
        oldStartTime: null,
        newStartTime: null,
        oldEndTime: null,
        newEndTime: null,
        changeReason: 'Paciente asistió a la consulta',
        changedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), 
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        appointmentId: appointmentIds[2], // Tercera cita (índice 2)
        oldStatus: null,
        newStatus: null,
        oldStartTime: generarHorario(generarFecha(-26), 8).start,
        newStartTime: generarHorario(generarFecha(-26), 10).start,
        oldEndTime: generarHorario(generarFecha(-26), 8).end,
        newEndTime: generarHorario(generarFecha(-26), 10).end,
        changeReason: 'Reagendamiento por solicitud del paciente',
        changedAt: new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000)
      },
      {
        appointmentId: appointmentIds[4], // Quinta cita (índice 4)
        oldStatus: 'Confirmada',
        newStatus: 'Cancelada',
        oldStartTime: null,
        newStartTime: null,
        oldEndTime: null,
        newEndTime: null,
        changeReason: 'Paciente no puede asistir por motivos personales',
        changedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        appointmentId: appointmentIds[6], // Séptima cita (índice 6)
        oldStatus: 'Confirmada',
        newStatus: 'No asistio',
        oldStartTime: null,
        newStartTime: null,
        oldEndTime: null,
        newEndTime: null,
        changeReason: 'Paciente no se presentó a la cita',
        changedAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000)
      },
      {
        appointmentId: appointmentIds[10], // Undécima cita (índice 10)
        oldStatus: 'Solicitada',
        newStatus: 'Confirmada',
        oldStartTime: null,
        newStartTime: null,
        oldEndTime: null,
        newEndTime: null,
        changeReason: 'Confirmación automática del sistema',
        changedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        appointmentId: appointmentIds[14], // Decimoquinta cita (índice 14)
        oldStatus: 'Solicitada',
        newStatus: 'Confirmada',
        oldStartTime: generarHorario(generarFecha(5), 9).start,
        newStartTime: generarHorario(generarFecha(5), 11).start,
        oldEndTime: generarHorario(generarFecha(5), 9).end,
        newEndTime: generarHorario(generarFecha(5), 11).end,
        changeReason: 'Cambio de horario por disponibilidad del profesional',
        changedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), 
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000)
      },
      {
        appointmentId: appointmentIds[19], // Vigésima cita (índice 19)
        oldStatus: 'Solicitada',
        newStatus: 'Confirmada',
        oldStartTime: null,
        newStartTime: null,
        oldEndTime: null,
        newEndTime: null,
        changeReason: 'Primera confirmación',
        changedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        appointmentId: appointmentIds[19], // Vigésima cita (índice 19)
        oldStatus: null,
        newStatus: null,
        oldStartTime: generarHorario(generarFecha(10), 14).start,
        newStartTime: generarHorario(generarFecha(10), 15).start,
        oldEndTime: generarHorario(generarFecha(10), 14).end,
        newEndTime: generarHorario(generarFecha(10), 15).end,
        changeReason: 'Ajuste de horario por reorganización de agenda',
        changedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      }
    ];
    await queryInterface.bulkInsert('AppointmentHistories', appointmentHistories, {});
    console.log('✅ Seeder ejecutado: 9 registros de historial creados');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('AppointmentHistories', {
      appointmentId: {
        [Sequelize.Op.between]: [1, 30]
      }
    }, {});
    console.log('✅ Rollback: Historial de citas eliminado');
    await queryInterface.bulkDelete('Appointments', {
      id: {
        [Sequelize.Op.between]: [1, 30]
      }
    }, {});
    console.log('✅ Rollback: Citas eliminadas');
  }
};
