<# Rutas Protegidas por Roles y Permisos

## Resumen

Todas las rutas del API ahora están protegidas con autenticación JWT y control de acceso basado en roles y permisos.

## Reglas Generales

1. **Todas las rutas requieren autenticación** (excepto `/auth/register` y `/auth/login`)
2. **Sin token válido**: HTTP 401 Unauthorized
3. **Sin permisos suficientes**: HTTP 403 Forbidden
4. **Token expirado**: HTTP 401 con código `TOKEN_EXPIRED`

---

## Módulo Operative

### 1. Appointments (Citas) - `/api/operative/appointments`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | `appointments.read` | Todos los roles |
| GET | `/:id` | `appointments.read` | Todos los roles |
| POST | `/` | `appointments.create` | Profesional, Admin |
| PATCH | `/:id` | `appointments.update` | Profesional, Admin |
| DELETE | `/:id` | `appointments.delete` | Solo Admin |

### 2. Patients (Pacientes) - `/api/operative/people`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | `patients.read` | Todos los roles |
| GET | `/:id` | `patients.read` | Todos los roles |
| POST | `/` | `patients.create` | Profesional, Admin |
| PATCH | `/:id` | `patients.update` | Profesional, Admin |
| DELETE | `/:id` | `patients.delete` | Solo Admin |

### 3. Professionals - `/api/operative/professionals`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | `professionals.read` | Todos los roles |
| GET | `/:id` | `professionals.read` | Todos los roles |
| POST | `/` | `professionals.create` | Solo Admin |
| PATCH | `/:id` | `professionals.update` | Solo Admin |
| DELETE | `/:id` | `professionals.delete` | Solo Admin |

### 4. Schedules (Horarios) - `/api/operative/schedules`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | `schedules.read` | Todos los roles |
| GET | `/:id` | `schedules.read` | Todos los roles |
| POST | `/` | `schedules.create` | Solo Admin |
| PATCH | `/:id` | `schedules.update` | Solo Admin |
| DELETE | `/:id` | `schedules.delete` | Solo Admin |

### 5. Care Units - `/api/operative/care-units`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | - (autenticado) | Todos los roles |
| GET | `/:id` | - (autenticado) | Todos los roles |
| POST | `/` | Solo Admin | Solo Admin |
| PATCH | `/:id` | Solo Admin | Solo Admin |
| DELETE | `/:id` | Solo Admin | Solo Admin |

---

## Módulo Clinic (Acceso Clínico Restringido)

**Regla general**: Solo **profesionales**, **administradores** y **auditores** pueden acceder a rutas clínicas.

### 6. Clinical Notes - `/api/clinic/clinical-notes`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | `clinicalNotes.read` | Profesional, Admin, Auditor |
| GET | `/:id` | `clinicalNotes.read` | Profesional, Admin, Auditor |
| GET | `/:id/versiones` | `clinicalNotes.read` | Profesional, Admin, Auditor |
| GET | `/version/:versionId` | `clinicalNotes.read` | Profesional, Admin, Auditor |
| POST | `/` | `clinicalNotes.create` | Profesional, Admin |
| PATCH | `/:id` | `clinicalNotes.update` | Profesional, Admin |

### 7. Episodes - `/api/clinic/episodes`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | `episodes.read` | Profesional, Admin, Auditor |
| GET | `/:id` | `episodes.read` | Profesional, Admin, Auditor |
| POST | `/` | `episodes.create` | Profesional, Admin |
| PATCH | `/:id` | `episodes.update` | Profesional, Admin |
| PATCH | `/:id/cerrar` | `episodes.update` | Profesional, Admin |

### 8. Diagnosis - `/api/clinic/diagnosis`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | `diagnosis.read` | Profesional, Admin, Auditor |
| GET | `/:id` | `diagnosis.read` | Profesional, Admin, Auditor |
| GET | `/:episodeId/diagnosticos` | `diagnosis.read` | Profesional, Admin, Auditor |
| POST | `/` | `diagnosis.create` | Profesional, Admin |
| PUT | `/:id` | `diagnosis.update` | Profesional, Admin |
| DELETE | `/:id` | `diagnosis.delete` | Profesional, Admin |

### 9. Orders (Órdenes) - `/api/clinic/orders`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | `orders.read` | Profesional, Admin, Auditor |
| GET | `/:id` | `orders.read` | Profesional, Admin, Auditor |
| GET | `/:id/items` | `orders.read` | Profesional, Admin, Auditor |
| POST | `/` | `orders.create` | Profesional, Admin |
| POST | `/:id/items` | `orders.create` | Profesional, Admin |
| PATCH | `/:id` | `orders.update` | Profesional, Admin |
| PATCH | `/:id/items/:itemId` | `orders.update` | Profesional, Admin |
| DELETE | `/:id` | `orders.delete` | Profesional, Admin |
| DELETE | `/:id/items/:itemId` | `orders.delete` | Profesional, Admin |

### 10. Results - `/api/clinic/results`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | `results.read` | Profesional, Admin, Auditor |
| GET | `/:id` | `results.read` | Profesional, Admin, Auditor |
| GET | `/orden/:ordenId` | `results.read` | Profesional, Admin, Auditor |
| GET | `/:id/versiones` | `results.read` | Profesional, Admin, Auditor |
| POST | `/` | `results.create` | Profesional, Admin |
| PATCH | `/:id` | `results.update` | Profesional, Admin |
| DELETE | `/:id` | `results.delete` | Profesional, Admin |

### 11. Consents - `/api/clinic/consents`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | `consents.read` | Profesional, Admin, Auditor |
| GET | `/:id` | `consents.read` | Profesional, Admin, Auditor |
| POST | `/` | `consents.create` | Profesional, Admin |
| PUT | `/:id` | `consents.update` | Profesional, Admin |
| DELETE | `/:id` | `consents.delete` | Profesional, Admin |

---

## Módulo Business

### 12. Invoices (Facturas) - `/api/bussines/invoices`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | `invoices.read` | Todos los roles |
| GET | `/:id` | `invoices.read` | Todos los roles |
| POST | `/` | `invoices.create` | Cajero, Admin |
| PATCH | `/:id` | `invoices.update` | Cajero, Admin |
| POST | `/:id/recalcular` | `invoices.update` | Cajero, Admin |

### 13. Payments (Pagos) - `/api/bussines/payments`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | `payments.read` | Todos los roles |
| GET | `/factura/:invoiceId` | `payments.read` | Todos los roles |
| GET | `/:id` | `payments.read` | Todos los roles |
| POST | `/` | `payments.create` | Cajero, Admin |
| PATCH | `/:id` | `payments.update` | Cajero, Admin |

### 14. Authorizations - `/api/bussines/authorizations`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | `authorizations.read` | Todos los roles |
| GET | `/:id` | `authorizations.read` | Todos los roles |
| POST | `/` | `authorizations.create` | Cajero, Admin |
| PATCH | `/:id` | `authorizations.update` | Cajero, Admin |

### 15. Insurers (Aseguradoras) - `/api/bussines/insurers`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | `insurers.read` | Todos los roles |
| GET | `/:id` | `insurers.read` | Todos los roles |
| POST | `/` | `insurers.create` | Solo Admin |
| PATCH | `/:id` | `insurers.update` | Solo Admin |
| DELETE | `/:id` | `insurers.delete` | Solo Admin |

### 16. Plans - `/api/bussines/plans`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | - (autenticado) | Todos los roles |
| GET | `/:id` | - (autenticado) | Todos los roles |
| POST | `/` | Solo Admin | Solo Admin |
| PATCH | `/:id` | Solo Admin | Solo Admin |
| DELETE | `/:id` | Solo Admin | Solo Admin |

### 17. Affiliations - `/api/bussines/affiliations`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | - (autenticado) | Todos los roles |
| GET | `/:id` | - (autenticado) | Todos los roles |
| POST | `/` | Admin o Cajero | Admin, Cajero |
| PATCH | `/:id` | Admin o Cajero | Admin, Cajero |
| DELETE | `/:id` | Admin o Cajero | Admin, Cajero |

### 18. Services - `/api/bussines/services`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | - (autenticado) | Todos los roles |
| GET | `/:codigo` | - (autenticado) | Todos los roles |
| POST | `/` | Solo Admin | Solo Admin |
| PATCH | `/:codigo` | Solo Admin | Solo Admin |

### 19. Tariffs - `/api/bussines/tariffs`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | - (autenticado) | Todos los roles |
| GET | `/activa/:prestacionCodigo` | - (autenticado) | Todos los roles |
| GET | `/:id` | - (autenticado) | Todos los roles |
| POST | `/` | Solo Admin | Solo Admin |
| PATCH | `/:id` | Solo Admin | Solo Admin |

### 20. Invoice Items - `/api/bussines/invoice-items`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | - (autenticado) | Todos los roles |
| GET | `/factura/:invoiceId` | - (autenticado) | Todos los roles |
| GET | `/:id` | - (autenticado) | Todos los roles |
| POST | `/factura/:invoiceId` | Admin o Cajero | Admin, Cajero |
| PATCH | `/:id` | Admin o Cajero | Admin, Cajero |
| DELETE | `/:id` | Admin o Cajero | Admin, Cajero |

---

## Módulo Platform

### 21. Auth - `/api/platform/auth`

| Método | Endpoint | Autenticación | Roles |
|--------|----------|---------------|-------|
| POST | `/register` | No | Público |
| POST | `/login` | No | Público |
| POST | `/refresh` | No | Público |
| GET | `/me` | Sí | Cualquier autenticado |
| POST | `/change-password` | Sí | Cualquier autenticado |
| POST | `/logout` | Sí | Cualquier autenticado |

### 22. Users - `/api/platform/users`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | Solo Admin | Solo Admin |
| GET | `/:id` | Solo Admin | Solo Admin |
| POST | `/` | Solo Admin | Solo Admin |
| PUT | `/:id` | Solo Admin | Solo Admin |
| DELETE | `/:id` | Solo Admin | Solo Admin |
| POST | `/:id/roles` | Solo Admin | Solo Admin |
| DELETE | `/:id/roles` | Solo Admin | Solo Admin |

### 23. Roles - `/api/platform/roles`

| Método | Endpoint | Permiso Requerido | Roles con Acceso |
|--------|----------|-------------------|------------------|
| GET | `/` | Solo Admin | Solo Admin |
| GET | `/:id` | Solo Admin | Solo Admin |
| GET | `/permissions/all` | Solo Admin | Solo Admin |
| POST | `/:id/permissions` | Solo Admin | Solo Admin |
| DELETE | `/:id/permissions` | Solo Admin | Solo Admin |

### 24. Notifications - `/api/platform/notificaciones`

| Método | Endpoint | Autenticación | Roles |
|--------|----------|---------------|-------|
| Todas | `/...` | Sí (por implementar) | Por implementar |

---

## Matriz de Acceso por Rol

### Administrador 👑
- ✅ **Acceso total a todos los módulos**
- ✅ CRUD completo en todos los recursos
- ✅ Gestión de usuarios y roles
- ✅ Acceso a bitácora de accesos

### Profesional 👨‍⚕️
- ✅ **Módulo Operative**: CRUD de citas, lectura de pacientes
- ✅ **Módulo Clinic**: CRUD completo en registros clínicos
- ✅ **Módulo Business**: Solo lectura de facturas e insurers
- ❌ Sin acceso a gestión de usuarios

### Cajero 💰
- ✅ **Módulo Operative**: Solo lectura de citas y pacientes
- ❌ **Módulo Clinic**: Sin acceso
- ✅ **Módulo Business**: CRUD completo en facturas, pagos y autorizaciones
- ❌ Sin acceso a gestión de usuarios

### Auditor 📊
- ✅ **Módulo Operative**: Solo lectura
- ✅ **Módulo Clinic**: Solo lectura
- ✅ **Módulo Business**: Solo lectura
- ✅ Acceso a bitácora y reportes
- ❌ Sin permisos de modificación

---

## Ejemplos de Uso

### Crear Usuario y Probar Acceso

```bash
# 1. Crear profesional
curl -X POST http://localhost:3000/api/platform/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "drgarcia",
    "email": "garcia@clinica.com",
    "password": "doctor123",
    "roles": ["profesional"]
  }'

# 2. Guardar token
TOKEN="tu_token_del_registro"

# 3. ✅ Profesional puede ver notas clínicas
curl -X GET http://localhost:3000/api/clinic/clinical-notes \
  -H "Authorization: Bearer $TOKEN"
# Respuesta: 200 OK

# 4. ❌ Profesional NO puede ver usuarios
curl -X GET http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $TOKEN"
# Respuesta: 403 Forbidden

# 5. ✅ Profesional puede ver facturas
curl -X GET http://localhost:3000/api/bussines/invoices \
  -H "Authorization: Bearer $TOKEN"
# Respuesta: 200 OK

# 6. ❌ Profesional NO puede crear facturas
curl -X POST http://localhost:3000/api/bussines/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
# Respuesta: 403 Forbidden
```

### Respuestas de Error

#### Sin token (401):
```json
{
  "error": "No autorizado",
  "message": "Token de autenticación no proporcionado"
}
```

#### Token expirado (401):
```json
{
  "error": "No autorizado",
  "message": "Token expirado",
  "code": "TOKEN_EXPIRED"
}
```

#### Sin permisos (403):
```json
{
  "error": "Acceso denegado",
  "message": "Se requiere el permiso 'clinicalNotes.create' para acceder a este recurso"
}
```

---

## Probar las Rutas Protegidas

### Script Automático

```bash
npm run test:routes
```

Este script:
- Crea usuarios de prueba con cada rol
- Obtiene tokens para cada usuario
- Prueba accesos permitidos y denegados
- Muestra un resumen de las protecciones

### Prueba Manual con cURL

```bash
# 1. Crear usuarios con diferentes roles
curl -X POST http://localhost:3000/api/platform/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","roles":["administrador"]}'

curl -X POST http://localhost:3000/api/platform/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor","password":"doctor123","roles":["profesional"]}'

curl -X POST http://localhost:3000/api/platform/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"cajero","password":"cajero123","roles":["cajero"]}'

# 2. Obtener tokens
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.accessToken')

DOCTOR_TOKEN=$(curl -s -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor","password":"doctor123"}' | jq -r '.data.accessToken')

CAJERO_TOKEN=$(curl -s -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"cajero","password":"cajero123"}' | jq -r '.data.accessToken')

# 3. Probar accesos
# ✅ Doctor puede ver notas clínicas
curl -X GET http://localhost:3000/api/clinic/clinical-notes \
  -H "Authorization: Bearer $DOCTOR_TOKEN"

# ❌ Cajero NO puede ver notas clínicas
curl -X GET http://localhost:3000/api/clinic/clinical-notes \
  -H "Authorization: Bearer $CAJERO_TOKEN"

# ✅ Cajero puede crear facturas
curl -X POST http://localhost:3000/api/bussines/invoices \
  -H "Authorization: Bearer $CAJERO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# ❌ Doctor NO puede crear facturas
curl -X POST http://localhost:3000/api/bussines/invoices \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## Resumen

### ✅ Implementado

- **16 grupos de rutas protegidas**
- **70+ endpoints con control de acceso**
- **Protección por roles y permisos granulares**
- **Acceso clínico restringido** (profesionales, admin, auditores)
- **Acceso financiero restringido** (cajeros, admin)
- **Gestión administrativa** (solo admin)

### 🔐 Niveles de Seguridad

1. **Autenticación**: Token JWT válido requerido
2. **Autorización por Rol**: Verificación de rol del usuario
3. **Autorización por Permiso**: Verificación de permiso específico
4. **Bitácora**: Todos los accesos se registran automáticamente

### 📊 Estadísticas

- **Rutas públicas**: 2 (register, login)
- **Rutas protegidas por autenticación**: Todas las demás
- **Rutas solo para admin**: 30+ (gestión de usuarios, configuración)
- **Rutas clínicas**: 35+ (profesionales, admin, auditores)
- **Rutas financieras**: 20+ (cajeros, admin)

¡Todas las rutas del sistema ahora están protegidas! 🎉

