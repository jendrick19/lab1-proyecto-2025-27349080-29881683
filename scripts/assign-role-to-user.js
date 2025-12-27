/**
 * Script para asignar roles a usuarios
 * 
 * Uso:
 *   node scripts/assign-role-to-user.js <username> <roleName>
 * 
 * Ejemplo:
 *   node scripts/assign-role-to-user.js testuser profesional
 */

require('dotenv').config();
const { User, Role, UserRole } = require('../database/models');

async function assignRoleToUser() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('❌ Error: Debes proporcionar username y nombre del rol');
    console.log('\n📝 Uso:');
    console.log('   node scripts/assign-role-to-user.js <username> <roleName>');
    console.log('\n💡 Ejemplo:');
    console.log('   node scripts/assign-role-to-user.js testuser profesional');
    console.log('\n📋 Roles disponibles:');
    console.log('   - administrador');
    console.log('   - profesional');
    console.log('   - cajero');
    console.log('   - auditor');
    console.log('');
    process.exit(1);
  }

  const [username, roleName] = args;

  try {
    console.log(`\n🔍 Buscando usuario '${username}'...`);
    
    // Buscar usuario
    const user = await User.findOne({
      where: { username }
    });

    if (!user) {
      console.error(`❌ Error: Usuario '${username}' no encontrado`);
      process.exit(1);
    }

    console.log(`✅ Usuario encontrado: ${user.username} (ID: ${user.id})`);

    // Buscar rol
    console.log(`\n🔍 Buscando rol '${roleName}'...`);
    const role = await Role.findOne({
      where: { nombre: roleName }
    });

    if (!role) {
      console.error(`❌ Error: Rol '${roleName}' no encontrado`);
      console.log('\n📋 Roles disponibles:');
      const roles = await Role.findAll();
      roles.forEach(r => console.log(`   - ${r.nombre}`));
      console.log('');
      process.exit(1);
    }

    console.log(`✅ Rol encontrado: ${role.nombre} (ID: ${role.id})`);

    // Verificar si ya tiene el rol asignado
    const existingAssignment = await UserRole.findOne({
      where: {
        userId: user.id,
        roleId: role.id
      }
    });

    if (existingAssignment) {
      console.log(`\n⚠️  El usuario '${username}' ya tiene asignado el rol '${roleName}'`);
      process.exit(0);
    }

    // Asignar rol
    console.log(`\n📝 Asignando rol...`);
    await UserRole.create({
      userId: user.id,
      roleId: role.id
    });

    console.log(`✅ Rol '${roleName}' asignado exitosamente a '${username}'`);
    
    // Mostrar roles actuales del usuario
    console.log(`\n👤 Roles actuales de '${username}':`);
    const userWithRoles = await User.findByPk(user.id, {
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: [] }
      }]
    });

    if (userWithRoles.roles && userWithRoles.roles.length > 0) {
      userWithRoles.roles.forEach(r => {
        console.log(`   - ${r.nombre}: ${r.descripcion}`);
      });
    } else {
      console.log('   (sin roles)');
    }
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

assignRoleToUser();

