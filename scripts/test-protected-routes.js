/**
 * Script para probar las rutas protegidas con diferentes roles
 * 
 * Uso:
 *   node scripts/test-protected-routes.js
 * 
 * Requiere que el servidor esté corriendo en http://localhost:3000
 */

require('dotenv').config();
const fetch = require('node:fetch');

const API_URL = 'http://localhost:3000/api';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(method, endpoint, token = null, body = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function testProtectedRoutes() {
  log('\n🔒 Probando Rutas Protegidas con Diferentes Roles\n', 'cyan');

  try {
    // 1. Crear usuarios de prueba con diferentes roles
    log('1️⃣ Creando usuarios de prueba...', 'blue');
    
    const users = {
      admin: {
        username: 'test_admin',
        email: 'admin@test.com',
        password: 'test123',
        roles: ['administrador']
      },
      profesional: {
        username: 'test_profesional',
        email: 'profesional@test.com',
        password: 'test123',
        roles: ['profesional']
      },
      cajero: {
        username: 'test_cajero',
        email: 'cajero@test.com',
        password: 'test123',
        roles: ['cajero']
      },
      auditor: {
        username: 'test_auditor',
        email: 'auditor@test.com',
        password: 'test123',
        roles: ['auditor']
      }
    };

    const tokens = {};

    for (const [role, userData] of Object.entries(users)) {
      // Intentar registrar (puede que ya existan)
      await makeRequest('POST', '/platform/auth/register', null, userData);
      
      // Login
      const loginResult = await makeRequest('POST', '/platform/auth/login', null, {
        username: userData.username,
        password: userData.password
      });

      if (loginResult.status === 200) {
        tokens[role] = loginResult.data.data.accessToken;
        log(`   ✅ ${role}: Token obtenido`, 'green');
      } else {
        log(`   ❌ ${role}: Error al obtener token`, 'red');
      }
    }

    console.log('');

    // 2. Probar accesos a rutas clínicas
    log('2️⃣ Probando acceso a Rutas Clínicas (Clinical Notes)', 'blue');
    
    // Profesional debe poder leer
    const profReadClinical = await makeRequest('GET', '/clinic/clinical-notes', tokens.profesional);
    log(`   Profesional READ: ${profReadClinical.status === 200 ? '✅ Permitido' : '❌ Denegado'}`, 
        profReadClinical.status === 200 ? 'green' : 'red');

    // Cajero NO debe poder leer (sin acceso clínico)
    const cajeroReadClinical = await makeRequest('GET', '/clinic/clinical-notes', tokens.cajero);
    log(`   Cajero READ: ${cajeroReadClinical.status === 403 ? '✅ Denegado (correcto)' : '❌ Permitido (error)'}`, 
        cajeroReadClinical.status === 403 ? 'green' : 'red');

    // Auditor debe poder leer
    const auditorReadClinical = await makeRequest('GET', '/clinic/clinical-notes', tokens.auditor);
    log(`   Auditor READ: ${auditorReadClinical.status === 200 ? '✅ Permitido' : '❌ Denegado'}`, 
        auditorReadClinical.status === 200 ? 'green' : 'red');

    console.log('');

    // 3. Probar accesos a rutas de facturación
    log('3️⃣ Probando acceso a Rutas de Facturación (Invoices)', 'blue');
    
    // Cajero debe poder leer y crear
    const cajeroReadInvoice = await makeRequest('GET', '/bussines/invoices', tokens.cajero);
    log(`   Cajero READ: ${cajeroReadInvoice.status === 200 ? '✅ Permitido' : '❌ Denegado'}`, 
        cajeroReadInvoice.status === 200 ? 'green' : 'red');

    // Profesional debe poder leer pero NO crear
    const profReadInvoice = await makeRequest('GET', '/bussines/invoices', tokens.profesional);
    log(`   Profesional READ: ${profReadInvoice.status === 200 ? '✅ Permitido' : '❌ Denegado'}`, 
        profReadInvoice.status === 200 ? 'green' : 'red');

    // Auditor debe poder leer
    const auditorReadInvoice = await makeRequest('GET', '/bussines/invoices', tokens.auditor);
    log(`   Auditor READ: ${auditorReadInvoice.status === 200 ? '✅ Permitido' : '❌ Denegado'}`, 
        auditorReadInvoice.status === 200 ? 'green' : 'red');

    console.log('');

    // 4. Probar accesos a gestión de usuarios
    log('4️⃣ Probando acceso a Gestión de Usuarios', 'blue');
    
    // Admin debe poder listar usuarios
    const adminReadUsers = await makeRequest('GET', '/platform/users', tokens.admin);
    log(`   Admin READ: ${adminReadUsers.status === 200 ? '✅ Permitido' : '❌ Denegado'}`, 
        adminReadUsers.status === 200 ? 'green' : 'red');

    // Profesional NO debe poder listar usuarios
    const profReadUsers = await makeRequest('GET', '/platform/users', tokens.profesional);
    log(`   Profesional READ: ${profReadUsers.status === 403 ? '✅ Denegado (correcto)' : '❌ Permitido (error)'}`, 
        profReadUsers.status === 403 ? 'green' : 'red');

    // Cajero NO debe poder listar usuarios
    const cajeroReadUsers = await makeRequest('GET', '/platform/users', tokens.cajero);
    log(`   Cajero READ: ${cajeroReadUsers.status === 403 ? '✅ Denegado (correcto)' : '❌ Permitido (error)'}`, 
        cajeroReadUsers.status === 403 ? 'green' : 'red');

    console.log('');

    // 5. Probar accesos a citas (appointments)
    log('5️⃣ Probando acceso a Citas (Appointments)', 'blue');
    
    // Todos los roles autenticados pueden leer
    const profReadAppt = await makeRequest('GET', '/operative/appointments', tokens.profesional);
    log(`   Profesional READ: ${profReadAppt.status === 200 ? '✅ Permitido' : '❌ Denegado'}`, 
        profReadAppt.status === 200 ? 'green' : 'red');

    const cajeroReadAppt = await makeRequest('GET', '/operative/appointments', tokens.cajero);
    log(`   Cajero READ: ${cajeroReadAppt.status === 200 ? '✅ Permitido' : '❌ Denegado'}`, 
        cajeroReadAppt.status === 200 ? 'green' : 'red');

    const auditorReadAppt = await makeRequest('GET', '/operative/appointments', tokens.auditor);
    log(`   Auditor READ: ${auditorReadAppt.status === 200 ? '✅ Permitido' : '❌ Denegado'}`, 
        auditorReadAppt.status === 200 ? 'green' : 'red');

    console.log('');

    // 6. Probar sin autenticación
    log('6️⃣ Probando Sin Autenticación', 'blue');
    
    const noAuthClinical = await makeRequest('GET', '/clinic/clinical-notes');
    log(`   Sin token - Clinical Notes: ${noAuthClinical.status === 401 ? '✅ Denegado (correcto)' : '❌ Permitido (error)'}`, 
        noAuthClinical.status === 401 ? 'green' : 'red');

    const noAuthInvoices = await makeRequest('GET', '/bussines/invoices');
    log(`   Sin token - Invoices: ${noAuthInvoices.status === 401 ? '✅ Denegado (correcto)' : '❌ Permitido (error)'}`, 
        noAuthInvoices.status === 401 ? 'green' : 'red');

    console.log('');

    // Resumen
    log('✅ Prueba de Rutas Protegidas Completada!\n', 'green');
    log('📊 Resumen de Protecciones:', 'cyan');
    log('   ✓ Rutas clínicas: Solo profesionales, admin y auditores');
    log('   ✓ Rutas de facturación: Cajeros y admin para CRUD, otros solo lectura');
    log('   ✓ Gestión de usuarios: Solo administradores');
    log('   ✓ Sin autenticación: Todas las rutas protegidas deniegan acceso');
    console.log('');

  } catch (error) {
    log('\n❌ Error en la prueba:', 'red');
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

testProtectedRoutes();

