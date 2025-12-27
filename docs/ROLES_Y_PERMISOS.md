# Sistema de Roles y Permisos

## Descripción

El sistema implementa autorización basada en **roles** (RBAC - Role-Based Access Control) y **permisos** granulares para controlar el acceso a los recursos del API.

## Arquitectura

```
Usuario 1:N UserRole N:1 Rol 1:N RolePermission N:1 Permiso
```

- Un **Usuario** puede tener múltiples **Roles**
- Un **Rol** puede tener múltiples **Permisos**
- Los permisos se asignan a roles, no directamente a usuarios

## Roles Implementados

### 1. Administrador (`administrador`)
- **Descripción**: Acceso completo al sistema
- **Permisos**: TODOS los permisos del sistema
- **Uso**: Gestión de usuarios, configuración, supervisión general

### 2. Profesional (`profesional`)
- **Descripción**: Profesional de la salud
- **Permisos**:
  - **Módulo Operative**: CRUD de citas, lectura de pacientes y profesionales
  - **Módulo Clinic**: CRUD completo de registros clínicos (notas, episodios, diagnósticos, órdenes, resultados, consentimientos)
  - **Módulo Business**: Solo lectura de facturas, aseguradoras y autorizaciones
  - **Módulo Platform**: Lectura de notificaciones
- **Uso**: Atención clínica, gestión de consultas

### 3. Cajero (`cajero`)
- **Descripción**: Personal de facturación y cobros
- **Permisos**:
  - **Módulo Operative**: Solo lectura de citas y pacientes
  - **Módulo Business**: CRUD completo de facturas, pagos y autorizaciones
  - **Módulo Platform**: Lectura de notificaciones
- **Uso**: Gestión financiera, cobros, facturación

### 4. Auditor (`auditor`)
- **Descripción**: Auditor del sistema
- **Permisos**: **Solo lectura** en todos los módulos
- **Permisos adicionales**: Acceso a bitácora de accesos y reportes
- **Uso**: Supervisión, auditoría, generación de reportes

## Permisos por Módulo

### Módulo Operative

| Recurso | Permisos disponibles |
|---------|---------------------|
| Appointments | `read`, `create`, `update`, `delete`, `changeStatus` |
| Patients | `read`, `create`, `update`, `delete` |
| Professionals | `read`, `create`, `update`, `delete` |
| Schedules | `read`, `create`, `update`, `delete` |

### Módulo Clinic

| Recurso | Permisos disponibles |
|---------|---------------------|
| Clinical Notes | `read`, `create`, `update`, `delete` |
| Episodes | `read`, `create`, `update`, `delete` |
| Diagnosis | `read`, `create`, `update`, `delete` |
| Orders | `read`, `create`, `update`, `delete` |
| Results | `read`, `create`, `update`, `delete` |
| Consents | `read`, `create`, `update`, `delete` |

### Módulo Business

| Recurso | Permisos disponibles |
|---------|---------------------|
| Invoices | `read`, `create`, `update`, `delete` |
| Payments | `read`, `create`, `update`, `delete` |
| Insurers | `read`, `create`, `update`, `delete` |
| Authorizations | `read`, `create`, `update`, `delete` |

### Módulo Platform

| Recurso | Permisos disponibles |
|---------|---------------------|
| Users | `read`, `create`, `update`, `delete` |
| Roles | `read`, `manage` |
| Notifications | `read`, `create` |
| Access Logs | `read` |
| Reports | `read`, `export` |

## Nomenclatura de Permisos

Los permisos siguen la convención: `recurso.accion`

Ejemplos:
- `appointments.read` - Ver citas
- `appointments.create` - Crear citas
- `invoices.update` - Modificar facturas
- `clinicalNotes.delete` - Eliminar notas clínicas

## Uso en el Código

### 1. Proteger Rutas con Roles

```javascript
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasRole, hasAnyRole, isAdmin, isProfessional } = require('../../../shared/middlewares/authorizationMiddleware');

// Solo administradores
router.delete('/users/:id', authenticate, isAdmin, deleteUserHandler);

// Solo profesionales
router.post('/clinical-notes', authenticate, isProfessional, createNoteHandler);

// Profesionales o administradores
router.get('/appointments', authenticate, hasAnyRole(['profesional', 'administrador']), listHandler);

// Rol específico
router.post('/invoices', authenticate, hasRole('cajero'), createInvoiceHandler);
```

### 2. Proteger Rutas con Permisos

```javascript
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasPermission, hasAnyPermission } = require('../../../shared/middlewares/authorizationMiddleware');

// Permiso específico
router.post('/appointments', 
  authenticate, 
  hasPermission('appointments.create'), 
  createAppointmentHandler
);

// Cualquiera de los permisos
router.get('/reports', 
  authenticate, 
  hasAnyPermission(['reports.read', 'reports.export']), 
  getReportsHandler
);
```

### 3. Verificaciones en Controladores

```javascript
const { userCan, isAdmin, requirePermission } = require('../../../shared/utils/permissionHelper');

const updateAppointmentHandler = async (req, res) => {
  try {
    const user = req.user;
    
    // Verificación simple
    if (!userCan(user, 'appointments', 'update')) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permiso para modificar citas'
      });
    }
    
    // O lanzar excepción
    requirePermission(user, 'appointments.update');
    
    // Tu lógica aquí...
    
    res.json({ message: 'Cita actualizada' });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};
```

### 4. Verificaciones Condicionales

```javascript
const { userCan, isAdmin } = require('../../../shared/utils/permissionHelper');

const getAppointmentHandler = async (req, res) => {
  try {
    const user = req.user;
    const appointment = await AppointmentService.findById(req.params.id);
    
    // Admins pueden ver todas, otros solo las suyas
    if (!isAdmin(user) && appointment.professionalId !== user.id) {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }
    
    // Filtrar datos sensibles según permisos
    const response = {
      ...appointment.toJSON()
    };
    
    // Solo mostrar datos financieros si tiene permiso
    if (!userCan(user, 'invoices', 'read')) {
      delete response.invoiceData;
    }
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## Asignar Roles a Usuarios

### Opción 1: Script de consola

```bash
node scripts/assign-role-to-user.js testuser profesional
```

### Opción 2: Programáticamente

```javascript
const { User, Role, UserRole } = require('../database/models');

async function assignRole(username, roleName) {
  const user = await User.findOne({ where: { username } });
  const role = await Role.findOne({ where: { nombre: roleName } });
  
  await UserRole.create({
    userId: user.id,
    roleId: role.id
  });
}

// Uso
await assignRole('doctor123', 'profesional');
```

### Opción 3: Al registrar usuario

```javascript
const AuthService = require('./services/AuthService');
const { Role, UserRole } = require('../database/models');

// Después de crear el usuario
const user = await User.create({ ...userData });

// Asignar rol por defecto
const defaultRole = await Role.findOne({ where: { nombre: 'profesional' } });
await UserRole.create({
  userId: user.id,
  roleId: defaultRole.id
});
```

## Helpers Disponibles

### Verificación de Roles

```javascript
const { 
  userHasRole,
  userHasAnyRole,
  userHasAllRoles,
  isAdmin,
  isProfessional,
  isCashier,
  isAuditor
} = require('../shared/utils/permissionHelper');

// En un controlador
if (isAdmin(req.user)) {
  // Lógica para administradores
}

if (userHasAnyRole(req.user, ['profesional', 'cajero'])) {
  // Lógica para profesionales o cajeros
}
```

### Verificación de Permisos

```javascript
const { 
  userHasPermission,
  userHasAnyPermission,
  userCan,
  userCanAny,
  requirePermission
} = require('../shared/utils/permissionHelper');

// Verificar permiso específico
if (userHasPermission(req.user, 'appointments.create')) {
  // Puede crear citas
}

// Verificar cualquier permiso
if (userHasAnyPermission(req.user, ['appointments.read', 'appointments.update'])) {
  // Puede leer o modificar citas
}

// Forma abreviada
if (userCan(req.user, 'invoices', 'create')) {
  // Puede crear facturas
}

// Lanzar error si no tiene permiso
try {
  requirePermission(req.user, 'users.delete');
  // Continuar si tiene permiso
} catch (error) {
  // Manejar error de permiso
}
```

## Middlewares de Autorización

### Por Rol

```javascript
const { hasRole, hasAnyRole, hasAllRoles, isAdmin } = require('../shared/middlewares/authorizationMiddleware');

// Requiere rol específico
router.post('/users', authenticate, hasRole('administrador'), createUserHandler);

// Requiere uno de varios roles
router.get('/reports', authenticate, hasAnyRole(['administrador', 'auditor']), getReportsHandler);

// Requiere todos los roles (poco común)
router.post('/critical', authenticate, hasAllRoles(['administrador', 'auditor']), criticalHandler);

// Atajos para roles comunes
router.delete('/data', authenticate, isAdmin, deleteDataHandler);
```

### Por Permiso

```javascript
const { hasPermission, hasAnyPermission, hasAllPermissions } = require('../shared/middlewares/authorizationMiddleware');

// Requiere permiso específico
router.post('/appointments', 
  authenticate, 
  hasPermission('appointments.create'), 
  createHandler
);

// Requiere uno de varios permisos
router.get('/clinical-data', 
  authenticate, 
  hasAnyPermission(['clinicalNotes.read', 'episodes.read']), 
  getClinicalDataHandler
);

// Requiere todos los permisos
router.post('/complex-operation', 
  authenticate, 
  hasAllPermissions(['orders.create', 'results.create']), 
  complexOperationHandler
);
```

## Ejemplo Completo: Proteger Módulo Clinic

```javascript
// src/modules/clinic/routes/ClinicalNoteRoutes.js
const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { 
  hasPermission, 
  hasAnyRole 
} = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler
} = require('../controllers/ClinicalNoteController');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar y ver: profesionales y administradores
router.get('/', 
  hasAnyRole(['profesional', 'administrador']),
  listHandler
);

router.get('/:id', 
  hasPermission('clinicalNotes.read'),
  getHandler
);

// Crear: solo con permiso específico
router.post('/', 
  hasPermission('clinicalNotes.create'),
  createHandler
);

// Actualizar: solo con permiso específico
router.put('/:id', 
  hasPermission('clinicalNotes.update'),
  updateHandler
);

// Eliminar: solo administradores
router.delete('/:id', 
  hasPermission('clinicalNotes.delete'),
  deleteHandler
);

module.exports = router;
```

## Probar el Sistema

### 1. Crear usuario con rol

```bash
# Registrar usuario
curl -X POST http://localhost:3000/api/platform/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor1","email":"doctor@example.com","password":"test123"}'

# Asignar rol
node scripts/assign-role-to-user.js doctor1 profesional
```

### 2. Obtener token con roles y permisos

```bash
# Login
curl -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor1","password":"test123"}'
```

**Respuesta incluirá roles y permisos:**
```json
{
  "user": {
    "id": 1,
    "username": "doctor1",
    "roles": ["profesional"],
    "permissions": [
      "appointments.read",
      "appointments.create",
      "clinicalNotes.read",
      "clinicalNotes.create",
      ...
    ]
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### 3. Probar acceso autorizado

```bash
# Con rol correcto - debe funcionar
curl -X GET http://localhost:3000/api/clinic/clinical-notes \
  -H "Authorization: Bearer TOKEN_DE_PROFESIONAL"
```

### 4. Probar acceso denegado

```bash
# Con rol incorrecto - debe dar 403
curl -X POST http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer TOKEN_DE_PROFESIONAL" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","email":"new@example.com"}'
```

**Respuesta esperada (403):**
```json
{
  "error": "Acceso denegado",
  "message": "Se requiere el rol 'administrador' para acceder a este recurso"
}
```

## Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| 200 | OK - Acción permitida y ejecutada |
| 401 | Unauthorized - No autenticado (sin token o token inválido) |
| 403 | Forbidden - Autenticado pero sin permisos suficientes |
| 404 | Not Found - Recurso no encontrado |

## Gestión de Roles y Permisos

### Consultar roles disponibles

```sql
SELECT * FROM Roles;
```

### Consultar permisos de un rol

```sql
SELECT p.clave, p.descripcion
FROM Permissions p
INNER JOIN RolePermissions rp ON p.id = rp.permissionId
INNER JOIN Roles r ON r.id = rp.roleId
WHERE r.nombre = 'profesional';
```

### Consultar roles de un usuario

```sql
SELECT r.nombre, r.descripcion
FROM Roles r
INNER JOIN UserRoles ur ON r.id = ur.roleId
INNER JOIN Users u ON u.id = ur.userId
WHERE u.username = 'doctor1';
```

### Agregar nuevo permiso a un rol

```javascript
const { Role, Permission, RolePermission } = require('../database/models');

async function addPermissionToRole(roleName, permissionKey) {
  const role = await Role.findOne({ where: { nombre: roleName } });
  const permission = await Permission.findOne({ where: { clave: permissionKey } });
  
  await RolePermission.create({
    roleId: role.id,
    permissionId: permission.id
  });
}

// Ejemplo
await addPermissionToRole('cajero', 'reports.read');
```

## Buenas Prácticas

### 1. Principio de Menor Privilegio
- Asigna solo los permisos necesarios para cada rol
- Revisa y ajusta permisos regularmente

### 2. Usar Permisos Granulares
```javascript
// ❌ Malo: Verificar solo el rol
if (userHasRole(req.user, 'profesional')) {
  // Demasiado amplio
}

// ✅ Bueno: Verificar permiso específico
if (userCan(req.user, 'clinicalNotes', 'delete')) {
  // Más preciso y seguro
}
```

### 3. Middleware en el Orden Correcto
```javascript
// ✅ Orden correcto
router.post('/resource',
  authenticate,           // 1. Autenticación primero
  hasRole('admin'),      // 2. Luego autorización
  validateData,          // 3. Validación
  handler               // 4. Finalmente el handler
);
```

### 4. Mensajes de Error Informativos
```javascript
if (!userCan(req.user, 'invoices', 'create')) {
  return res.status(403).json({
    error: 'Acceso denegado',
    message: 'Se requiere el permiso "invoices.create" para crear facturas',
    requiredPermission: 'invoices.create',
    userRoles: req.user.roles
  });
}
```

### 5. Logging de Intentos de Acceso Denegado
```javascript
const logAccessDenied = (user, resource, action) => {
  console.log(`[ACCESO DENEGADO] Usuario: ${user.username}, Recurso: ${resource}, Acción: ${action}`);
  // Opcionalmente guardar en base de datos
};
```

## Troubleshooting

### Problema: "Usuario autenticado pero sin permisos"
**Solución**: Verifica que el usuario tenga roles asignados:
```bash
node scripts/assign-role-to-user.js username profesional
```

### Problema: "Token no incluye roles/permisos"
**Solución**: El token se genera al hacer login. Vuelve a hacer login para obtener un token actualizado con los nuevos roles.

### Problema: "403 Forbidden en todas las rutas"
**Solución**: 
1. Verifica que los middlewares estén en el orden correcto
2. Confirma que el usuario tiene roles asignados
3. Revisa que los permisos del rol incluyan lo necesario

## Migración y Seeders

### Ejecutar migración
```bash
npx sequelize-cli db:migrate
```

### Ejecutar seeder de roles y permisos
```bash
npx sequelize-cli db:seed --seed 20251227005044-demo-roles-and-permissions.js
```

### Revertir seeder
```bash
npx sequelize-cli db:seed:undo --seed 20251227005044-demo-roles-and-permissions.js
```

## Próximos Pasos

- Implementar UI para gestión de roles y permisos
- Agregar endpoints API para CRUD de roles/permisos
- Implementar permisos a nivel de registro (ej: solo ver propias citas)
- Agregar cache de permisos para mejor rendimiento
- Implementar jerarquía de roles (herencia de permisos)

## Resumen

✅ **Sistema Completo**:
- 4 roles predefinidos (administrador, profesional, cajero, auditor)
- 70+ permisos granulares
- Middlewares de autorización por roles y permisos
- Helpers para verificaciones programáticas
- Seeders con configuración inicial
- Documentación completa

El sistema de roles y permisos está listo para usar y puede extenderse fácilmente agregando nuevos roles o permisos según las necesidades del proyecto.

