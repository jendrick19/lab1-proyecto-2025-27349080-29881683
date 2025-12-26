/**
 * Script para enviar un email de prueba
 * 
 * Uso:
 *   node scripts/send-test-email.js
 *   node scripts/send-test-email.js tu-email@gmail.com
 */

require('dotenv').config();
const NotificationService = require('../src/modules/platform/services/NotificationService');

async function sendTestEmail() {
  const email = process.argv[2] || 'test@example.com';
  
  console.log('\n📧 Enviando email de prueba...');
  console.log(`   Destinatario: ${email}\n`);

  try {
    const notification = await NotificationService.createNotification({
      peopleId: 1,
      type: 'email',
      recipient: email,
      template: 'cita_confirmacion',
      subject: '🎉 Email de Prueba - Sistema de Notificaciones',
      payload: {
        nombrePaciente: 'Paciente de Prueba',
        nombreProfesional: 'Dr. García López',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        unidad: 'Consulta Externa',
        modalidad: 'Presencial'
      }
    });

    console.log('✅ Email enviado exitosamente!\n');
    console.log('📊 Detalles:');
    console.log(`   ID: ${notification.id}`);
    console.log(`   Estado: ${notification.status}`);
    console.log(`   Plantilla: ${notification.template}`);
    console.log('');
    
    if (notification.status === 'enviado') {
      console.log('🔍 Para ver el email:');
      console.log('   1. Ve a https://mailtrap.io/inboxes');
      console.log('   2. Selecciona tu Inbox');
      console.log('   3. Verás el correo que acabas de enviar');
    } else {
      console.log('⚠️  El email está en estado:', notification.status);
      if (notification.errorMessage) {
        console.log('   Error:', notification.errorMessage);
      }
    }
    console.log('');

  } catch (error) {
    console.error('❌ Error al enviar el email:\n');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('Invalid login')) {
      console.log('💡 Verifica tu configuración de Mailtrap en el archivo .env');
    }
    
    process.exit(1);
  }

  NotificationService.close();
  process.exit(0);
}

sendTestEmail();

