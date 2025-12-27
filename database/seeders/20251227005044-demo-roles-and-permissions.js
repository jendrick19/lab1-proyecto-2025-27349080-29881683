'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1. Crear Roles
    const roles = await queryInterface.bulkInsert('Roles', [
      {
        nombre: 'administrador',
        descripcion: 'Acceso completo al sistema. Puede gestionar usuarios, configuración y todos los módulos.',
        createdAt: now,
        updatedAt: now
      },
      {
        nombre: 'profesional',
        descripcion: 'Profesional de la salud. Acceso a registros clínicos, citas y gestión de pacientes.',
        createdAt: now,
        updatedAt: now
      },
      {
        nombre: 'cajero',
        descripcion: 'Personal de facturación y cobros. Acceso a módulos financieros y de facturación.',
        createdAt: now,
        updatedAt: now
      },
      {
        nombre: 'auditor',
        descripcion: 'Auditor del sistema. Acceso de solo lectura a todos los módulos para revisión y auditoría.',
        createdAt: now,
        updatedAt: now
      }
    ], { returning: true });

    // Obtener IDs de los roles insertados
    const roleIds = await queryInterface.sequelize.query(
      `SELECT id, nombre FROM Roles WHERE nombre IN ('administrador', 'profesional', 'cajero', 'auditor')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const adminRoleId = roleIds.find(r => r.nombre === 'administrador').id;
    const professionalRoleId = roleIds.find(r => r.nombre === 'profesional').id;
    const cashierRoleId = roleIds.find(r => r.nombre === 'cajero').id;
    const auditorRoleId = roleIds.find(r => r.nombre === 'auditor').id;

    // 2. Crear Permisos por módulo
    const permissions = [];

    // === MÓDULO OPERATIVE ===
    // Appointments (Citas)
    permissions.push(
      { clave: 'appointments.read', descripcion: 'Ver citas', createdAt: now, updatedAt: now },
      { clave: 'appointments.create', descripcion: 'Crear citas', createdAt: now, updatedAt: now },
      { clave: 'appointments.update', descripcion: 'Modificar citas', createdAt: now, updatedAt: now },
      { clave: 'appointments.delete', descripcion: 'Eliminar citas', createdAt: now, updatedAt: now },
      { clave: 'appointments.changeStatus', descripcion: 'Cambiar estado de citas', createdAt: now, updatedAt: now }
    );

    // PeopleAttended (Pacientes)
    permissions.push(
      { clave: 'patients.read', descripcion: 'Ver pacientes', createdAt: now, updatedAt: now },
      { clave: 'patients.create', descripcion: 'Registrar pacientes', createdAt: now, updatedAt: now },
      { clave: 'patients.update', descripcion: 'Modificar datos de pacientes', createdAt: now, updatedAt: now },
      { clave: 'patients.delete', descripcion: 'Eliminar pacientes', createdAt: now, updatedAt: now }
    );

    // Professionals
    permissions.push(
      { clave: 'professionals.read', descripcion: 'Ver profesionales', createdAt: now, updatedAt: now },
      { clave: 'professionals.create', descripcion: 'Registrar profesionales', createdAt: now, updatedAt: now },
      { clave: 'professionals.update', descripcion: 'Modificar profesionales', createdAt: now, updatedAt: now },
      { clave: 'professionals.delete', descripcion: 'Eliminar profesionales', createdAt: now, updatedAt: now }
    );

    // Schedules (Horarios)
    permissions.push(
      { clave: 'schedules.read', descripcion: 'Ver horarios', createdAt: now, updatedAt: now },
      { clave: 'schedules.create', descripcion: 'Crear horarios', createdAt: now, updatedAt: now },
      { clave: 'schedules.update', descripcion: 'Modificar horarios', createdAt: now, updatedAt: now },
      { clave: 'schedules.delete', descripcion: 'Eliminar horarios', createdAt: now, updatedAt: now }
    );

    // === MÓDULO CLINIC ===
    // Clinical Notes (Notas Clínicas)
    permissions.push(
      { clave: 'clinicalNotes.read', descripcion: 'Ver notas clínicas', createdAt: now, updatedAt: now },
      { clave: 'clinicalNotes.create', descripcion: 'Crear notas clínicas', createdAt: now, updatedAt: now },
      { clave: 'clinicalNotes.update', descripcion: 'Modificar notas clínicas', createdAt: now, updatedAt: now },
      { clave: 'clinicalNotes.delete', descripcion: 'Eliminar notas clínicas', createdAt: now, updatedAt: now }
    );

    // Episodes (Episodios)
    permissions.push(
      { clave: 'episodes.read', descripcion: 'Ver episodios', createdAt: now, updatedAt: now },
      { clave: 'episodes.create', descripcion: 'Crear episodios', createdAt: now, updatedAt: now },
      { clave: 'episodes.update', descripcion: 'Modificar episodios', createdAt: now, updatedAt: now },
      { clave: 'episodes.delete', descripcion: 'Eliminar episodios', createdAt: now, updatedAt: now }
    );

    // Diagnosis (Diagnósticos)
    permissions.push(
      { clave: 'diagnosis.read', descripcion: 'Ver diagnósticos', createdAt: now, updatedAt: now },
      { clave: 'diagnosis.create', descripcion: 'Crear diagnósticos', createdAt: now, updatedAt: now },
      { clave: 'diagnosis.update', descripcion: 'Modificar diagnósticos', createdAt: now, updatedAt: now },
      { clave: 'diagnosis.delete', descripcion: 'Eliminar diagnósticos', createdAt: now, updatedAt: now }
    );

    // Orders (Órdenes médicas)
    permissions.push(
      { clave: 'orders.read', descripcion: 'Ver órdenes médicas', createdAt: now, updatedAt: now },
      { clave: 'orders.create', descripcion: 'Crear órdenes médicas', createdAt: now, updatedAt: now },
      { clave: 'orders.update', descripcion: 'Modificar órdenes médicas', createdAt: now, updatedAt: now },
      { clave: 'orders.delete', descripcion: 'Eliminar órdenes médicas', createdAt: now, updatedAt: now }
    );

    // Results (Resultados)
    permissions.push(
      { clave: 'results.read', descripcion: 'Ver resultados', createdAt: now, updatedAt: now },
      { clave: 'results.create', descripcion: 'Registrar resultados', createdAt: now, updatedAt: now },
      { clave: 'results.update', descripcion: 'Modificar resultados', createdAt: now, updatedAt: now },
      { clave: 'results.delete', descripcion: 'Eliminar resultados', createdAt: now, updatedAt: now }
    );

    // Consents (Consentimientos)
    permissions.push(
      { clave: 'consents.read', descripcion: 'Ver consentimientos', createdAt: now, updatedAt: now },
      { clave: 'consents.create', descripcion: 'Crear consentimientos', createdAt: now, updatedAt: now },
      { clave: 'consents.update', descripcion: 'Modificar consentimientos', createdAt: now, updatedAt: now },
      { clave: 'consents.delete', descripcion: 'Eliminar consentimientos', createdAt: now, updatedAt: now }
    );

    // === MÓDULO BUSSINES ===
    // Invoices (Facturas)
    permissions.push(
      { clave: 'invoices.read', descripcion: 'Ver facturas', createdAt: now, updatedAt: now },
      { clave: 'invoices.create', descripcion: 'Crear facturas', createdAt: now, updatedAt: now },
      { clave: 'invoices.update', descripcion: 'Modificar facturas', createdAt: now, updatedAt: now },
      { clave: 'invoices.delete', descripcion: 'Eliminar facturas', createdAt: now, updatedAt: now }
    );

    // Payments (Pagos)
    permissions.push(
      { clave: 'payments.read', descripcion: 'Ver pagos', createdAt: now, updatedAt: now },
      { clave: 'payments.create', descripcion: 'Registrar pagos', createdAt: now, updatedAt: now },
      { clave: 'payments.update', descripcion: 'Modificar pagos', createdAt: now, updatedAt: now },
      { clave: 'payments.delete', descripcion: 'Eliminar pagos', createdAt: now, updatedAt: now }
    );

    // Insurers (Aseguradoras)
    permissions.push(
      { clave: 'insurers.read', descripcion: 'Ver aseguradoras', createdAt: now, updatedAt: now },
      { clave: 'insurers.create', descripcion: 'Crear aseguradoras', createdAt: now, updatedAt: now },
      { clave: 'insurers.update', descripcion: 'Modificar aseguradoras', createdAt: now, updatedAt: now },
      { clave: 'insurers.delete', descripcion: 'Eliminar aseguradoras', createdAt: now, updatedAt: now }
    );

    // Authorizations (Autorizaciones)
    permissions.push(
      { clave: 'authorizations.read', descripcion: 'Ver autorizaciones', createdAt: now, updatedAt: now },
      { clave: 'authorizations.create', descripcion: 'Crear autorizaciones', createdAt: now, updatedAt: now },
      { clave: 'authorizations.update', descripcion: 'Modificar autorizaciones', createdAt: now, updatedAt: now },
      { clave: 'authorizations.delete', descripcion: 'Eliminar autorizaciones', createdAt: now, updatedAt: now }
    );

    // === MÓDULO PLATFORM ===
    // Users (Usuarios)
    permissions.push(
      { clave: 'users.read', descripcion: 'Ver usuarios', createdAt: now, updatedAt: now },
      { clave: 'users.create', descripcion: 'Crear usuarios', createdAt: now, updatedAt: now },
      { clave: 'users.update', descripcion: 'Modificar usuarios', createdAt: now, updatedAt: now },
      { clave: 'users.delete', descripcion: 'Eliminar usuarios', createdAt: now, updatedAt: now }
    );

    // Roles y Permisos
    permissions.push(
      { clave: 'roles.read', descripcion: 'Ver roles', createdAt: now, updatedAt: now },
      { clave: 'roles.manage', descripcion: 'Gestionar roles y permisos', createdAt: now, updatedAt: now }
    );

    // Notifications
    permissions.push(
      { clave: 'notifications.read', descripcion: 'Ver notificaciones', createdAt: now, updatedAt: now },
      { clave: 'notifications.create', descripcion: 'Crear notificaciones', createdAt: now, updatedAt: now }
    );

    // Access Logs (Bitácora)
    permissions.push(
      { clave: 'accessLogs.read', descripcion: 'Ver bitácora de accesos', createdAt: now, updatedAt: now }
    );

    // Reports (Reportes)
    permissions.push(
      { clave: 'reports.read', descripcion: 'Ver reportes', createdAt: now, updatedAt: now },
      { clave: 'reports.export', descripcion: 'Exportar reportes', createdAt: now, updatedAt: now }
    );

    // Insertar permisos
    await queryInterface.bulkInsert('Permissions', permissions);

    // Obtener IDs de permisos insertados
    const permissionIds = await queryInterface.sequelize.query(
      `SELECT id, clave FROM Permissions`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Helper function para obtener ID de permiso por clave
    const getPermissionId = (clave) => {
      const perm = permissionIds.find(p => p.clave === clave);
      return perm ? perm.id : null;
    };

    // 3. Asignar permisos a roles
    const rolePermissions = [];

    // === ADMINISTRADOR: Todos los permisos ===
    permissionIds.forEach(perm => {
      rolePermissions.push({
        roleId: adminRoleId,
        permissionId: perm.id,
        createdAt: now,
        updatedAt: now
      });
    });

    // === PROFESIONAL: Acceso clínico completo ===
    const professionalPerms = [
      // Operative
      'appointments.read', 'appointments.create', 'appointments.update', 'appointments.changeStatus',
      'patients.read', 'patients.create', 'patients.update',
      'professionals.read',
      'schedules.read',
      // Clinic (completo)
      'clinicalNotes.read', 'clinicalNotes.create', 'clinicalNotes.update',
      'episodes.read', 'episodes.create', 'episodes.update',
      'diagnosis.read', 'diagnosis.create', 'diagnosis.update',
      'orders.read', 'orders.create', 'orders.update',
      'results.read', 'results.create', 'results.update',
      'consents.read', 'consents.create', 'consents.update',
      // Business (solo lectura)
      'invoices.read',
      'insurers.read',
      'authorizations.read',
      // Platform
      'notifications.read'
    ];

    professionalPerms.forEach(permClave => {
      const permId = getPermissionId(permClave);
      if (permId) {
        rolePermissions.push({
          roleId: professionalRoleId,
          permissionId: permId,
          createdAt: now,
          updatedAt: now
        });
      }
    });

    // === CAJERO: Acceso financiero y administrativo ===
    const cashierPerms = [
      // Operative (lectura)
      'appointments.read',
      'patients.read',
      // Business (completo)
      'invoices.read', 'invoices.create', 'invoices.update',
      'payments.read', 'payments.create', 'payments.update',
      'insurers.read',
      'authorizations.read', 'authorizations.create', 'authorizations.update',
      // Platform
      'notifications.read'
    ];

    cashierPerms.forEach(permClave => {
      const permId = getPermissionId(permClave);
      if (permId) {
        rolePermissions.push({
          roleId: cashierRoleId,
          permissionId: permId,
          createdAt: now,
          updatedAt: now
        });
      }
    });

    // === AUDITOR: Solo lectura en todos los módulos ===
    const auditorPerms = [
      // Operative (solo lectura)
      'appointments.read',
      'patients.read',
      'professionals.read',
      'schedules.read',
      // Clinic (solo lectura)
      'clinicalNotes.read',
      'episodes.read',
      'diagnosis.read',
      'orders.read',
      'results.read',
      'consents.read',
      // Business (solo lectura)
      'invoices.read',
      'payments.read',
      'insurers.read',
      'authorizations.read',
      // Platform
      'users.read',
      'roles.read',
      'notifications.read',
      'accessLogs.read',
      'reports.read',
      'reports.export'
    ];

    auditorPerms.forEach(permClave => {
      const permId = getPermissionId(permClave);
      if (permId) {
        rolePermissions.push({
          roleId: auditorRoleId,
          permissionId: permId,
          createdAt: now,
          updatedAt: now
        });
      }
    });

    // Insertar asignaciones de permisos a roles
    await queryInterface.bulkInsert('RolePermissions', rolePermissions);

    console.log('✅ Roles y permisos creados exitosamente');
  },

  async down(queryInterface, Sequelize) {
    // Eliminar en orden inverso por las dependencias
    await queryInterface.bulkDelete('RolePermissions', null, {});
    await queryInterface.bulkDelete('UserRoles', null, {});
    await queryInterface.bulkDelete('Permissions', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
  }
};