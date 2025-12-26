/**
 * Script de prueba para verificar la configuración de Mailtrap
 * 
 * Uso:
 *   node scripts/test-mailtrap.js
 * 
 * Este script enviará un correo de prueba usando tu configuración de Mailtrap
 */

require('dotenv').config();
const NotificationService = require('../src/modules/platform/services/NotificationService');

async function testMailtrap() {
  console.log('\n📧 Iniciando prueba de Mailtrap...\n');

  // Verificar que las variables de entorno estén configuradas
  console.log('🔍 Verificando configuración:');
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || '❌ NO CONFIGURADO'}`);
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || '❌ NO CONFIGURADO'}`);
  console.log(`   SMTP_USER: ${process.env.SMTP_USER ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);
  console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);
  console.log('');

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ ERROR: Faltan credenciales de Mailtrap en el archivo .env');
    console.log('\n📝 Por favor, configura las siguientes variables en tu archivo .env:');
    console.log('   SMTP_HOST=sandbox.smtp.mailtrap.io');
    console.log('   SMTP_PORT=2525');
    console.log('   SMTP_USER=tu_username_de_mailtrap');
    console.log('   SMTP_PASS=tu_password_de_mailtrap');
    console.log('\n📖 Para más información, revisa: docs/CONFIGURACION_MAILTRAP.md\n');
    process.exit(1);
  }

  try {
    console.log('📤 Enviando correo de prueba...\n');

    // Enviar una notificación de prueba
    const notification = await NotificationService.createNotification({
      peopleId: 1,
      type: 'email',
      recipient: 'test@example.com', // Mailtrap capturará este correo
      template: 'cita_confirmacion',
      subject: '🎉 Prueba de Mailtrap - Sistema de Notificaciones',
      payload: {
        nombrePaciente: 'Paciente de Prueba',
        nombreProfesional: 'Dr. García',
        fecha: new Date().toLocaleDateString('es-ES'),
        hora: '10:00 AM',
        unidad: 'Consulta Externa',
        modalidad: 'Presencial'
      }
    });

    console.log('✅ ¡Correo enviado exitosamente!\n');
    console.log('📊 Detalles de la notificación:');
    console.log(`   ID: ${notification.id}`);
    console.log(`   Estado: ${notification.status}`);
    console.log(`   Destinatario: ${notification.recipient}`);
    console.log(`   Asunto: ${notification.subject}`);
    console.log('');
    console.log('🔍 Para ver el correo:');
    console.log('   1. Ve a https://mailtrap.io/inboxes');
    console.log('   2. Selecciona tu Inbox');
    console.log('   3. Verás el correo que acabas de enviar');
    console.log('');

  } catch (error) {
    console.error('❌ Error al enviar el correo:\n');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('Invalid login')) {
      console.log('💡 Sugerencia: Verifica que tu SMTP_USER y SMTP_PASS sean correctos');
      console.log('   Cópialos exactamente como aparecen en Mailtrap (sin espacios extras)\n');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
      console.log('💡 Sugerencia: Problema de conexión');
      console.log('   - Verifica tu conexión a internet');
      console.log('   - Prueba cambiar SMTP_PORT a 587 o 465\n');
    } else {
      console.log('📖 Para más ayuda, revisa: docs/CONFIGURACION_MAILTRAP.md\n');
    }
    
    process.exit(1);
  }

  // Cerrar la conexión
  NotificationService.close();
  console.log('👋 Prueba completada. Cerrando conexión...\n');
  process.exit(0);
}

// Ejecutar la prueba
testMailtrap().catch(error => {
  console.error('❌ Error inesperado:', error);
  process.exit(1);
});

