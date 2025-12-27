# API de Gestión de Usuarios y Roles

## Descripción

API RESTful para gestionar usuarios, roles y permisos del sistema. Todos los endpoints requieren autenticación y rol de administrador.

## Base URL

```
http://localhost:3000/api/platform
```

## Autenticación

Todos los endpoints requieren:
- **Autenticación**: Token JWT válido
- **Autorización**: Rol de administrador

```
Authorization: Bearer <access_token>
```

---

## Endpoints de Autenticación

### 1. Registro de Usuario (con roles)

Registra un nuevo usuario en el sistema y opcionalmente asigna roles.

**POST** `/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "doctor1",
  "email": "doctor1@clinica.com",
  "password": "password123",
  "roles": ["profesional"]
}
```

**Parámetros:**
- `username` (string, requerido): Nombre de usuario único
- `email` (string, requerido): Correo electrónico
- `password` (string, requerido): Contraseña (mínimo 6 caracteres)
- `roles` (array, opcional): Array de nombres de roles a asignar

**Roles disponibles:**
- `administrador`
- `profesional`
- `cajero`
- `auditor`

**Respuesta exitosa (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "username": "doctor1",
      "email": "doctor1@clinica.com",
      "status": true,
      "createdAt": "2025-12-27T10:00:00.000Z",
      "roles": ["profesional"],
      "permissions": [
        "appointments.read",
        "appointments.create",
        "clinicalNotes.read",
        "clinicalNotes.create",
        ...
      ]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

**Ejemplos:**

```bash
# Registrar usuario sin rol
curl -X POST http://localhost:3000/api/platform/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1",
    "email": "user1@clinica.com",
    "password": "pass123"
  }'

# Registrar usuario con rol de profesional
curl -X POST http://localhost:3000/api/platform/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "drgarcia",
    "email": "garcia@clinica.com",
    "password": "doctor123",
    "roles": ["profesional"]
  }'

# Registrar usuario con múltiples roles
curl -X POST http://localhost:3000/api/platform/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@clinica.com",
    "password": "admin123",
    "roles": ["administrador", "profesional"]
  }'
```

---

## Endpoints de Usuarios

### 2. Listar Usuarios

Obtiene la lista de todos los usuarios del sistema con sus roles.

**GET** `/users`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (boolean, opcional): Filtrar por estado (true/false)
- `search` (string, opcional): Buscar por username o email

**Respuesta exitosa (200):**
```json
{
  "message": "Usuarios obtenidos exitosamente",
  "data": [
    {
      "id": 1,
      "username": "drgarcia",
      "email": "garcia@clinica.com",
      "status": true,
      "createdAt": "2025-12-27T10:00:00.000Z",
      "updatedAt": "2025-12-27T10:00:00.000Z",
      "roles": [
        {
          "id": 2,
          "nombre": "profesional",
          "descripcion": "Profesional de la salud..."
        }
      ]
    }
  ]
}
```

**Ejemplo:**
```bash
# Listar todos los usuarios
curl -X GET http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Buscar usuarios
curl -X GET "http://localhost:3000/api/platform/users?search=doctor" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Filtrar usuarios activos
curl -X GET "http://localhost:3000/api/platform/users?status=true" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 3. Obtener Usuario por ID

Obtiene información detallada de un usuario específico incluyendo roles y permisos.

**GET** `/users/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Respuesta exitosa (200):**
```json
{
  "message": "Usuario obtenido exitosamente",
  "data": {
    "id": 1,
    "username": "drgarcia",
    "email": "garcia@clinica.com",
    "status": true,
    "createdAt": "2025-12-27T10:00:00.000Z",
    "updatedAt": "2025-12-27T10:00:00.000Z",
    "roles": [
      {
        "id": 2,
        "nombre": "profesional",
        "descripcion": "Profesional de la salud...",
        "permissions": [
          {
            "id": 1,
            "clave": "appointments.read",
            "descripcion": "Ver citas"
          },
          {
            "id": 2,
            "clave": "appointments.create",
            "descripcion": "Crear citas"
          }
        ]
      }
    ]
  }
}
```

**Ejemplo:**
```bash
curl -X GET http://localhost:3000/api/platform/users/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 4. Crear Usuario

Crea un nuevo usuario con roles asignados. Similar al registro pero requiere ser administrador.

**POST** `/users`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "username": "cajero1",
  "email": "cajero1@clinica.com",
  "password": "cajero123",
  "roles": ["cajero"],
  "status": true
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 5,
    "username": "cajero1",
    "email": "cajero1@clinica.com",
    "status": true,
    "roles": [
      {
        "id": 3,
        "nombre": "cajero",
        "descripcion": "Personal de facturación y cobros..."
      }
    ]
  }
}
```

**Ejemplo:**
```bash
curl -X POST http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "auditor1",
    "email": "auditor@clinica.com",
    "password": "auditor123",
    "roles": ["auditor"]
  }'
```

### 5. Actualizar Usuario

Actualiza información de un usuario existente. Puede modificar email, contraseña, roles y estado.

**PUT** `/users/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "email": "nuevo.email@clinica.com",
  "password": "nueva_contraseña",
  "roles": ["profesional", "administrador"],
  "status": true
}
```

**Nota:** Todos los campos son opcionales. Solo se actualizarán los campos enviados.

**Respuesta exitosa (200):**
```json
{
  "message": "Usuario actualizado exitosamente",
  "data": {
    "id": 1,
    "username": "drgarcia",
    "email": "nuevo.email@clinica.com",
    "status": true,
    "roles": [
      {
        "id": 2,
        "nombre": "profesional",
        "descripcion": "..."
      },
      {
        "id": 1,
        "nombre": "administrador",
        "descripcion": "..."
      }
    ]
  }
}
```

**Ejemplos:**
```bash
# Actualizar email
curl -X PUT http://localhost:3000/api/platform/users/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "nuevo@clinica.com"}'

# Cambiar roles
curl -X PUT http://localhost:3000/api/platform/users/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roles": ["profesional", "cajero"]}'

# Desactivar usuario
curl -X PUT http://localhost:3000/api/platform/users/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": false}'

# Resetear contraseña
curl -X PUT http://localhost:3000/api/platform/users/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "nueva_password123"}'
```

### 6. Eliminar Usuario

Elimina un usuario y todas sus asignaciones de roles.

**DELETE** `/users/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Respuesta exitosa (200):**
```json
{
  "message": "Usuario eliminado exitosamente"
}
```

**Ejemplo:**
```bash
curl -X DELETE http://localhost:3000/api/platform/users/5 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 7. Asignar Roles a Usuario

Asigna roles adicionales a un usuario sin eliminar los existentes.

**POST** `/users/:id/roles`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "roles": ["auditor", "cajero"]
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Roles asignados exitosamente",
  "data": {
    "id": 1,
    "username": "drgarcia",
    "roles": [
      {
        "id": 2,
        "nombre": "profesional",
        "descripcion": "..."
      },
      {
        "id": 4,
        "nombre": "auditor",
        "descripcion": "..."
      },
      {
        "id": 3,
        "nombre": "cajero",
        "descripcion": "..."
      }
    ]
  }
}
```

**Ejemplo:**
```bash
curl -X POST http://localhost:3000/api/platform/users/1/roles \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roles": ["auditor"]}'
```

### 8. Remover Roles de Usuario

Remueve roles específicos de un usuario.

**DELETE** `/users/:id/roles`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "roles": ["cajero"]
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Roles removidos exitosamente",
  "data": {
    "id": 1,
    "username": "drgarcia",
    "roles": [
      {
        "id": 2,
        "nombre": "profesional",
        "descripcion": "..."
      }
    ]
  }
}
```

**Ejemplo:**
```bash
curl -X DELETE http://localhost:3000/api/platform/users/1/roles \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roles": ["auditor", "cajero"]}'
```

---

## Endpoints de Roles

### 9. Listar Roles

Obtiene la lista de todos los roles disponibles con sus permisos.

**GET** `/roles`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Respuesta exitosa (200):**
```json
{
  "message": "Roles obtenidos exitosamente",
  "data": [
    {
      "id": 1,
      "nombre": "administrador",
      "descripcion": "Acceso completo al sistema...",
      "createdAt": "2025-12-27T00:00:00.000Z",
      "updatedAt": "2025-12-27T00:00:00.000Z",
      "permissions": [
        {
          "id": 1,
          "clave": "appointments.read",
          "descripcion": "Ver citas"
        },
        {
          "id": 2,
          "clave": "appointments.create",
          "descripcion": "Crear citas"
        }
      ]
    }
  ]
}
```

**Ejemplo:**
```bash
curl -X GET http://localhost:3000/api/platform/roles \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 10. Obtener Rol por ID

Obtiene información detallada de un rol específico con todos sus permisos.

**GET** `/roles/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Respuesta exitosa (200):**
```json
{
  "message": "Rol obtenido exitosamente",
  "data": {
    "id": 2,
    "nombre": "profesional",
    "descripcion": "Profesional de la salud...",
    "createdAt": "2025-12-27T00:00:00.000Z",
    "updatedAt": "2025-12-27T00:00:00.000Z",
    "permissions": [
      {
        "id": 1,
        "clave": "appointments.read",
        "descripcion": "Ver citas"
      },
      {
        "id": 2,
        "clave": "appointments.create",
        "descripcion": "Crear citas"
      }
    ]
  }
}
```

**Ejemplo:**
```bash
curl -X GET http://localhost:3000/api/platform/roles/2 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 11. Listar Permisos Disponibles

Obtiene la lista de todos los permisos disponibles en el sistema.

**GET** `/roles/permissions/all`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Respuesta exitosa (200):**
```json
{
  "message": "Permisos obtenidos exitosamente",
  "data": [
    {
      "id": 1,
      "clave": "appointments.read",
      "descripcion": "Ver citas",
      "createdAt": "2025-12-27T00:00:00.000Z",
      "updatedAt": "2025-12-27T00:00:00.000Z"
    },
    {
      "id": 2,
      "clave": "appointments.create",
      "descripcion": "Crear citas",
      "createdAt": "2025-12-27T00:00:00.000Z",
      "updatedAt": "2025-12-27T00:00:00.000Z"
    }
  ]
}
```

**Ejemplo:**
```bash
curl -X GET http://localhost:3000/api/platform/roles/permissions/all \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 12. Asignar Permisos a Rol

Asigna permisos adicionales a un rol sin eliminar los existentes.

**POST** `/roles/:id/permissions`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "permissions": [
    "invoices.read",
    "invoices.create"
  ]
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Permisos asignados exitosamente",
  "data": {
    "id": 2,
    "nombre": "profesional",
    "descripcion": "...",
    "permissions": [
      {
        "id": 15,
        "clave": "invoices.read",
        "descripcion": "Ver facturas"
      },
      {
        "id": 16,
        "clave": "invoices.create",
        "descripcion": "Crear facturas"
      }
    ]
  }
}
```

**Ejemplo:**
```bash
curl -X POST http://localhost:3000/api/platform/roles/2/permissions \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": [
      "reports.read",
      "reports.export"
    ]
  }'
```

### 13. Remover Permisos de Rol

Remueve permisos específicos de un rol.

**DELETE** `/roles/:id/permissions`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "permissions": [
    "invoices.delete"
  ]
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Permisos removidos exitosamente",
  "data": {
    "id": 2,
    "nombre": "profesional",
    "permissions": [...]
  }
}
```

**Ejemplo:**
```bash
curl -X DELETE http://localhost:3000/api/platform/roles/2/permissions \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": ["invoices.delete", "users.delete"]
  }'
```

---

## Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos inválidos o incompletos |
| 401 | Unauthorized - No autenticado o token inválido |
| 403 | Forbidden - No tiene permisos suficientes |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - El recurso ya existe |
| 500 | Internal Server Error - Error del servidor |

---

## Flujo Completo de Gestión

### Escenario 1: Crear un nuevo profesional

```bash
# 1. Login como administrador
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.accessToken')

# 2. Crear usuario profesional
curl -X POST http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "drlopez",
    "email": "drlopez@clinica.com",
    "password": "doctor123",
    "roles": ["profesional"]
  }'

# 3. Verificar que se creó correctamente
curl -X GET http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Escenario 2: Modificar permisos de un rol

```bash
# 1. Ver permisos actuales del rol cajero
curl -X GET http://localhost:3000/api/platform/roles/3 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 2. Agregar permiso de reportes
curl -X POST http://localhost:3000/api/platform/roles/3/permissions \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permissions": ["reports.read"]}'

# 3. Verificar cambios
curl -X GET http://localhost:3000/api/platform/roles/3 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Resumen de Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registrar usuario (con roles opcionales) |
| GET | `/users` | Listar usuarios |
| GET | `/users/:id` | Obtener usuario |
| POST | `/users` | Crear usuario |
| PUT | `/users/:id` | Actualizar usuario |
| DELETE | `/users/:id` | Eliminar usuario |
| POST | `/users/:id/roles` | Asignar roles |
| DELETE | `/users/:id/roles` | Remover roles |
| GET | `/roles` | Listar roles |
| GET | `/roles/:id` | Obtener rol |
| GET | `/roles/permissions/all` | Listar permisos |
| POST | `/roles/:id/permissions` | Asignar permisos |
| DELETE | `/roles/:id/permissions` | Remover permisos |

¡Todo listo para gestionar usuarios y roles desde el API! 🚀

