/**
 * Script para probar la autenticación JWT y la bitácora de accesos
 * 
 * Uso:
 *   node scripts/test-auth.js
 */

require('dotenv').config();
const AuthService = require('../src/modules/platform/services/AuthService');
const { User, AccessLog } = require('../database/models');

async function testAuth() {
  console.log('\n🔐 Iniciando prueba de autenticación y bitácora...\n');

  try {
    // 1. Crear un usuario de prueba
    console.log('1️⃣ Creando usuario de prueba...');
    
    // Verificar si el usuario ya existe
    let testUser = await User.findOne({ where: { username: 'testuser' } });
    
    if (testUser) {
      console.log('   ℹ️  Usuario de prueba ya existe, eliminando...');
      await testUser.destroy();
    }

    const registerResult = await AuthService.register({
      username: 'testuser',
      email: 'test@example.com',
      password: 'test123456'
    });

    console.log('   ✅ Usuario creado exitosamente');
    console.log(`   ID: ${registerResult.user.id}`);
    console.log(`   Username: ${registerResult.user.username}`);
    console.log(`   Email: ${registerResult.user.email}`);
    console.log('');

    // 2. Hacer login
    console.log('2️⃣ Probando login...');
    const loginResult = await AuthService.login('testuser', 'test123456');
    
    console.log('   ✅ Login exitoso');
    console.log(`   Access Token: ${loginResult.accessToken.substring(0, 50)}...`);
    console.log(`   Refresh Token: ${loginResult.refreshToken.substring(0, 50)}...`);
    console.log(`   Expira en: ${loginResult.expiresIn}`);
    console.log('');

    // 3. Verificar el access token
    console.log('3️⃣ Verificando access token...');
    const decoded = await AuthService.verifyToken(loginResult.accessToken);
    
    console.log('   ✅ Token válido');
    console.log(`   User ID: ${decoded.id}`);
    console.log(`   Username: ${decoded.username}`);
    console.log(`   Tipo: ${decoded.type}`);
    console.log('');

    // 4. Obtener información del usuario
    console.log('4️⃣ Obteniendo información del usuario...');
    const userInfo = await AuthService.getUserById(decoded.id);
    
    console.log('   ✅ Usuario obtenido');
    console.log(`   ID: ${userInfo.id}`);
    console.log(`   Username: ${userInfo.username}`);
    console.log(`   Email: ${userInfo.email}`);
    console.log(`   Estado: ${userInfo.status ? 'Activo' : 'Inactivo'}`);
    console.log('');

    // 5. Refrescar access token
    console.log('5️⃣ Probando refresh token...');
    const refreshResult = await AuthService.refreshAccessToken(loginResult.refreshToken);
    
    console.log('   ✅ Token refrescado exitosamente');
    console.log(`   Nuevo Access Token: ${refreshResult.accessToken.substring(0, 50)}...`);
    console.log('');

    // 6. Probar cambio de contraseña
    console.log('6️⃣ Probando cambio de contraseña...');
    await AuthService.changePassword(decoded.id, 'test123456', 'newpassword123');
    
    console.log('   ✅ Contraseña cambiada exitosamente');
    console.log('');

    // 7. Verificar que la nueva contraseña funciona
    console.log('7️⃣ Verificando nueva contraseña...');
    const loginWithNewPassword = await AuthService.login('testuser', 'newpassword123');
    
    console.log('   ✅ Login con nueva contraseña exitoso');
    console.log('');

    // 8. Verificar bitácora de accesos (si hay registros)
    console.log('8️⃣ Consultando bitácora de accesos...');
    const accessLogs = await AccessLog.findAll({
      where: { userId: decoded.id },
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    if (accessLogs.length > 0) {
      console.log(`   ✅ Se encontraron ${accessLogs.length} registros en la bitácora:`);
      accessLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.accion} ${log.recurso} - ${log.statusCode} (${log.responseTime}ms)`);
        console.log(`      IP: ${log.ip} | ${new Date(log.createdAt).toLocaleString()}`);
      });
    } else {
      console.log('   ℹ️  No hay registros en la bitácora aún.');
      console.log('   💡 Inicia el servidor y haz peticiones al API para verlos.');
    }
    console.log('');

    // Resumen
    console.log('✅ ¡Todas las pruebas completadas exitosamente!\n');
    console.log('📝 Resumen de funcionalidades implementadas:');
    console.log('   ✓ Registro de usuarios con hash de contraseñas');
    console.log('   ✓ Login y generación de tokens JWT');
    console.log('   ✓ Access tokens y refresh tokens');
    console.log('   ✓ Verificación de tokens');
    console.log('   ✓ Cambio de contraseña');
    console.log('   ✓ Bitácora de accesos (AccessLogs)');
    console.log('');
    console.log('🚀 Para probar desde el API:');
    console.log('   1. Inicia el servidor: npm run dev');
    console.log('   2. Registra un usuario: POST /api/platform/auth/register');
    console.log('   3. Login: POST /api/platform/auth/login');
    console.log('   4. Usa el token en las rutas protegidas:');
    console.log('      Authorization: Bearer <tu-token>');
    console.log('');
    console.log('📊 Endpoints disponibles:');
    console.log('   POST   /api/platform/auth/register');
    console.log('   POST   /api/platform/auth/login');
    console.log('   POST   /api/platform/auth/refresh');
    console.log('   GET    /api/platform/auth/me (protegida)');
    console.log('   POST   /api/platform/auth/change-password (protegida)');
    console.log('   POST   /api/platform/auth/logout (protegida)');
    console.log('');
    console.log('🔐 Variables de entorno necesarias en .env:');
    console.log('   JWT_SECRET=tu-secreto-super-seguro');
    console.log('   JWT_EXPIRES_IN=24h');
    console.log('   JWT_REFRESH_EXPIRES_IN=7d');
    console.log('');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

testAuth();

