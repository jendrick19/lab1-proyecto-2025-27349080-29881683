const emailTemplates = {
  cita_confirmacion: {
    subject: 'Confirmación de su cita médica',
    html: (payload) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Cita Confirmada</h2>
        <p>Estimado/a <strong>${payload.nombrePaciente}</strong>,</p>
        <p>Su cita ha sido confirmada con los siguientes detalles:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Profesional:</strong> ${payload.nombreProfesional}</p>
          <p><strong>Fecha:</strong> ${payload.fecha}</p>
          <p><strong>Hora:</strong> ${payload.hora}</p>
          <p><strong>Lugar:</strong> ${payload.unidad}</p>
          ${payload.modalidad ? `<p><strong>Modalidad:</strong> ${payload.modalidad}</p>` : ''}
        </div>
        <p>Por favor, llegue 10 minutos antes de su cita.</p>
        <p>Saludos cordiales,<br><strong>Equipo Médico</strong></p>
      </div>
    `,
    text: (payload) => `
Estimado/a ${payload.nombrePaciente},

Su cita ha sido confirmada:
- Profesional: ${payload.nombreProfesional}
- Fecha: ${payload.fecha}
- Hora: ${payload.hora}
- Lugar: ${payload.unidad}

Por favor, llegue 10 minutos antes.

Saludos cordiales,
Equipo Médico
    `
  },

  cita_recordatorio: {
    subject: 'Recordatorio: Cita médica mañana',
    html: (payload) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Recordatorio de Cita</h2>
        <p>Estimado/a <strong>${payload.nombrePaciente}</strong>,</p>
        <p>Le recordamos su cita médica programada para mañana:</p>
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p><strong>Profesional:</strong> ${payload.nombreProfesional}</p>
          <p><strong>Fecha:</strong> ${payload.fecha}</p>
          <p><strong>Hora:</strong> ${payload.hora}</p>
          <p><strong>Lugar:</strong> ${payload.unidad}</p>
        </div>
        <p>Si necesita cancelar o reprogramar, por favor contáctenos con anticipación.</p>
        <p>Saludos cordiales,<br><strong>Equipo Médico</strong></p>
      </div>
    `,
    text: (payload) => `
Recordatorio de Cita

Estimado/a ${payload.nombrePaciente},

Su cita médica es mañana:
- Profesional: ${payload.nombreProfesional}
- Fecha: ${payload.fecha}
- Hora: ${payload.hora}
- Lugar: ${payload.unidad}

Si necesita cancelar, contáctenos con anticipación.

Saludos cordiales,
Equipo Médico
    `
  },

  resultado_disponible: {
    subject: 'Sus resultados médicos están disponibles',
    html: (payload) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Resultados Disponibles</h2>
        <p>Estimado/a <strong>${payload.nombrePaciente}</strong>,</p>
        <p>Sus resultados de <strong>${payload.tipoExamen}</strong> ya están disponibles.</p>
        <div style="background-color: #d1ecf1; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8;">
          <p><strong>Tipo:</strong> ${payload.tipoExamen}</p>
          <p><strong>Fecha del examen:</strong> ${payload.fechaExamen}</p>
          <p><strong>Estado:</strong> Disponible</p>
        </div>
        <p>Puede solicitar sus resultados en recepción o consultarlos en nuestro portal web.</p>
        <p>Saludos cordiales,<br><strong>Equipo Médico</strong></p>
      </div>
    `,
    text: (payload) => `
Resultados Disponibles

Estimado/a ${payload.nombrePaciente},

Sus resultados de ${payload.tipoExamen} están disponibles.
Fecha del examen: ${payload.fechaExamen}

Puede solicitarlos en recepción.

Saludos cordiales,
Equipo Médico
    `
  },

  factura_emitida: {
    subject: 'Factura emitida',
    html: (payload) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Factura Emitida</h2>
        <p>Estimado/a <strong>${payload.nombrePaciente}</strong>,</p>
        <p>Se ha generado una nueva factura por los servicios recibidos:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Número de factura:</strong> ${payload.numeroFactura}</p>
          <p><strong>Fecha:</strong> ${payload.fecha}</p>
          <p><strong>Monto total:</strong> ${payload.moneda} ${payload.total}</p>
          <p><strong>Estado:</strong> ${payload.estado}</p>
        </div>
        <p>Puede realizar el pago en nuestras oficinas o a través de nuestros medios de pago disponibles.</p>
        <p>Saludos cordiales,<br><strong>Departamento de Facturación</strong></p>
      </div>
    `,
    text: (payload) => `
Factura Emitida

Estimado/a ${payload.nombrePaciente},

Nueva factura generada:
- Número: ${payload.numeroFactura}
- Fecha: ${payload.fecha}
- Monto: ${payload.moneda} ${payload.total}
- Estado: ${payload.estado}

Puede realizar el pago en nuestras oficinas.

Saludos cordiales,
Departamento de Facturación
    `
  }
};

const getEmailTemplate = (templateName, payload) => {
  const template = emailTemplates[templateName];
  
  if (!template) {
    return {
      subject: 'Notificación',
      html: `<p>${JSON.stringify(payload)}</p>`,
      text: JSON.stringify(payload)
    };
  }

  return {
    subject: template.subject,
    html: template.html(payload),
    text: template.text(payload)
  };
};

const getAvailableTemplates = () => {
  return Object.keys(emailTemplates);
};

module.exports = {
  emailTemplates,
  getEmailTemplate,
  getAvailableTemplates
};

