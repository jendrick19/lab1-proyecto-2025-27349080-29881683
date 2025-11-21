'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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

    // Generar 30 citas variadas
    const appointments = [];

    // Función para generar fecha en rango
    const generarFecha = (diasDesdeHoy) => {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + diasDesdeHoy);
      return fecha;
    };

    // Función para generar horario (8:00 - 16:00)
    const generarHorario = (fecha, horaInicio) => {
      const start = new Date(fecha);
      start.setHours(horaInicio, 0, 0, 0);
      
      const end = new Date(start);
      end.setMinutes(start.getMinutes() + 30); // Citas de 30 minutos
      
      return { start, end };
    };

    // Función para seleccionar elemento aleatorio
    const randomItem = (array) => array[Math.floor(Math.random() * array.length)];

    // Crear 30 citas distribuidas en el tiempo
    for (let i = 0; i < 30; i++) {
      // Distribuir citas: pasadas, presentes y futuras
      let diasOffset;
      let estado;
      
      if (i < 10) {
        // Citas pasadas (cumplidas, canceladas, no asistió)
        diasOffset = -30 + i * 2;
        estado = randomItem(['Cumplida', 'Cancelada', 'No asistio']);
      } else if (i < 20) {
        // Citas próximas (solicitadas, confirmadas)
        diasOffset = i - 10;
        estado = randomItem(['Solicitada', 'Confirmada']);
      } else {
        // Citas futuras (solicitadas, confirmadas)
        diasOffset = 5 + (i - 20) * 2;
        estado = randomItem(['Solicitada', 'Confirmada']);
      }

      const fechaCita = generarFecha(diasOffset);
      const hora = 8 + (i % 8); // Distribuir entre 8:00 y 16:00
      const { start, end } = generarHorario(fechaCita, hora);

      // IDs de personas, profesionales y unidades (1-10 de cada uno)
      const peopleId = (i % 50) + 1; // Tenemos 50 personas
      const professionalId = (i % 10) + 1;
      const unitId = (i % 10) + 1;
      const scheduleId = (i % 10) + 1;

      appointments.push({
        peopleId,
        professionalId,
        unitId,
        scheduleId: Math.random() > 0.3 ? scheduleId : null, // 70% tienen schedule
        startTime: start,
        endTime: end,
        channel: randomItem(canales),
        status: estado,
        reason: motivos[i % motivos.length],
        observations: observaciones[i % observaciones.length],
        createdAt: new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000), // Creada 7 días antes
        updatedAt: now
      });
    }

    // Insertar todas las citas
    await queryInterface.bulkInsert('Appointments', appointments, {});

    console.log('✅ Seeder ejecutado: 30 citas creadas');

    // Crear historial para algunas citas (simular cambios)
    const appointmentHistories = [
      // Cita 1: cambio de estado de Solicitada a Confirmada
      {
        appointmentId: 1,
        oldStatus: 'Solicitada',
        newStatus: 'Confirmada',
        oldStartTime: null,
        newStartTime: null,
        oldEndTime: null,
        newEndTime: null,
        changeReason: 'Confirmación del paciente vía telefónica',
        changedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      // Cita 1: cambio de Confirmada a Cumplida
      {
        appointmentId: 1,
        oldStatus: 'Confirmada',
        newStatus: 'Cumplida',
        oldStartTime: null,
        newStartTime: null,
        oldEndTime: null,
        newEndTime: null,
        changeReason: 'Paciente asistió a la consulta',
        changedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      // Cita 3: cambio de horario
      {
        appointmentId: 3,
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
      // Cita 5: cancelación
      {
        appointmentId: 5,
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
      // Cita 7: cambio de Confirmada a No asistió
      {
        appointmentId: 7,
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
      // Cita 11: confirmación
      {
        appointmentId: 11,
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
      // Cita 15: cambio de horario y confirmación
      {
        appointmentId: 15,
        oldStatus: 'Solicitada',
        newStatus: 'Confirmada',
        oldStartTime: generarHorario(generarFecha(5), 9).start,
        newStartTime: generarHorario(generarFecha(5), 11).start,
        oldEndTime: generarHorario(generarFecha(5), 9).end,
        newEndTime: generarHorario(generarFecha(5), 11).end,
        changeReason: 'Cambio de horario por disponibilidad del profesional',
        changedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hora atrás
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000)
      },
      // Cita 20: múltiples cambios
      {
        appointmentId: 20,
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
        appointmentId: 20,
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

    // Insertar historial
    await queryInterface.bulkInsert('AppointmentHistories', appointmentHistories, {});

    console.log('✅ Seeder ejecutado: 9 registros de historial creados');
  },

  async down(queryInterface, Sequelize) {
    // Primero eliminar el historial (por la foreign key)
    await queryInterface.bulkDelete('AppointmentHistories', {
      appointmentId: {
        [Sequelize.Op.between]: [1, 30]
      }
    }, {});

    console.log('✅ Rollback: Historial de citas eliminado');

    // Luego eliminar las citas
    await queryInterface.bulkDelete('Appointments', {
      id: {
        [Sequelize.Op.between]: [1, 30]
      }
    }, {});

    console.log('✅ Rollback: Citas eliminadas');
  }
};

