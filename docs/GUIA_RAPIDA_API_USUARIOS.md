# Guía Rápida: Crear Usuarios con Roles via API

## 🎯 Resumen

Ahora puedes crear usuarios y asignarles roles directamente desde el API, sin necesidad de scripts.

## 📋 Métodos Disponibles

### Método 1: Registro Público (con roles opcionales)

Cualquier persona puede registrarse. Opcionalmente puedes especificar roles.

```bash
curl -X POST http://localhost:3000/api/platform/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "doctor1",
    "email": "doctor1@clinica.com",
    "password": "password123",
    "roles": ["profesional"]
  }'
```

### Método 2: Creación por Administrador

Solo administradores pueden crear usuarios con cualquier rol.

```bash
curl -X POST http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "cajero1",
    "email": "cajero1@clinica.com",
    "password": "cajero123",
    "roles": ["cajero"]
  }'
```

---

## 🚀 Ejemplos Prácticos

### 1. Crear Administrador

```bash
# Registro inicial (primer usuario)
curl -X POST http://localhost:3000/api/platform/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@clinica.com",
    "password": "Admin123!",
    "roles": ["administrador"]
  }'
```

**Respuesta:**
```json
{
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@clinica.com",
      "roles": ["administrador"],
      "permissions": ["... todos los permisos ..."]
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 2. Crear Profesionales

```bash
# Guardar token de admin
ADMIN_TOKEN="tu_token_aqui"

# Crear doctor 1
curl -X POST http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "drgarcia",
    "email": "drgarcia@clinica.com",
    "password": "doctor123",
    "roles": ["profesional"]
  }'

# Crear doctor 2
curl -X POST http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "drlopez",
    "email": "drlopez@clinica.com",
    "password": "doctor123",
    "roles": ["profesional"]
  }'
```

### 3. Crear Cajeros

```bash
curl -X POST http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "cajero1",
    "email": "cajero1@clinica.com",
    "password": "cajero123",
    "roles": ["cajero"]
  }'
```

### 4. Crear Auditor

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

### 5. Crear Usuario con Múltiples Roles

```bash
curl -X POST http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "supervisor",
    "email": "supervisor@clinica.com",
    "password": "super123",
    "roles": ["profesional", "auditor"]
  }'
```

---

## 🔧 Gestión de Roles

### Listar Usuarios

```bash
curl -X GET http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Ver Usuario Específico

```bash
curl -X GET http://localhost:3000/api/platform/users/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Agregar Rol a Usuario Existente

```bash
curl -X POST http://localhost:3000/api/platform/users/1/roles \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roles": ["auditor"]
  }'
```

### Cambiar Roles de Usuario

```bash
# Esto REEMPLAZA todos los roles
curl -X PUT http://localhost:3000/api/platform/users/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roles": ["profesional", "cajero"]
  }'
```

### Remover Rol de Usuario

```bash
curl -X DELETE http://localhost:3000/api/platform/users/1/roles \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roles": ["cajero"]
  }'
```

### Desactivar Usuario

```bash
curl -X PUT http://localhost:3000/api/platform/users/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": false
  }'
```

### Cambiar Contraseña de Usuario

```bash
curl -X PUT http://localhost:3000/api/platform/users/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "nueva_contraseña_123"
  }'
```

---

## 📊 Gestión de Roles y Permisos

### Listar Roles Disponibles

```bash
curl -X GET http://localhost:3000/api/platform/roles \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Ver Permisos de un Rol

```bash
curl -X GET http://localhost:3000/api/platform/roles/2 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Listar Todos los Permisos

```bash
curl -X GET http://localhost:3000/api/platform/roles/permissions/all \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Agregar Permisos a un Rol

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

### Quitar Permisos de un Rol

```bash
curl -X DELETE http://localhost:3000/api/platform/roles/2/permissions \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": [
      "users.delete"
    ]
  }'
```

---

## 🎓 Flujo Completo de Setup

```bash
# 1. Crear primer administrador (registro público)
curl -X POST http://localhost:3000/api/platform/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@clinica.com",
    "password": "Admin123!",
    "roles": ["administrador"]
  }'

# 2. Login como admin y guardar token
RESPONSE=$(curl -s -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}')

ADMIN_TOKEN=$(echo $RESPONSE | jq -r '.data.accessToken')
echo "Token guardado: $ADMIN_TOKEN"

# 3. Crear equipo de trabajo
# Profesionales
curl -X POST http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "drgarcia",
    "email": "garcia@clinica.com",
    "password": "doctor123",
    "roles": ["profesional"]
  }'

curl -X POST http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "drlopez",
    "email": "lopez@clinica.com",
    "password": "doctor123",
    "roles": ["profesional"]
  }'

# Cajeros
curl -X POST http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "cajero1",
    "email": "cajero1@clinica.com",
    "password": "cajero123",
    "roles": ["cajero"]
  }'

curl -X POST http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "cajero2",
    "email": "cajero2@clinica.com",
    "password": "cajero123",
    "roles": ["cajero"]
  }'

# Auditor
curl -X POST http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "auditor1",
    "email": "auditor@clinica.com",
    "password": "auditor123",
    "roles": ["auditor"]
  }'

# 4. Verificar usuarios creados
curl -X GET http://localhost:3000/api/platform/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

---

## 📝 Roles Disponibles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `administrador` | Acceso total al sistema | Todos |
| `profesional` | Personal médico | Citas, registros clínicos, pacientes |
| `cajero` | Personal de facturación | Facturas, pagos, autorizaciones |
| `auditor` | Auditoría y reportes | Solo lectura en todo + reportes |

---

## ⚠️ Notas Importantes

1. **Primer Usuario**: El primer usuario debe registrarse con rol de `administrador`

2. **Token de Admin**: Guarda el token del administrador para crear otros usuarios

3. **Contraseñas**: En producción, usa contraseñas fuertes

4. **Roles Múltiples**: Un usuario puede tener varios roles

5. **Actualización de Roles**: Al actualizar roles con `PUT /users/:id`, se REEMPLAZAN todos los roles. Para agregar, usa `POST /users/:id/roles`

---

## 🔍 Troubleshooting

### Error 409: "El usuario ya existe"
El username ya está en uso. Usa otro username.

### Error 401: "No autorizado"
- Verifica que el token sea válido
- Verifica que el formato sea: `Authorization: Bearer <token>`
- El token puede haber expirado, haz login nuevamente

### Error 403: "Acceso denegado"
- Solo administradores pueden gestionar usuarios
- Verifica que tu usuario tenga rol de `administrador`

### Usuario creado pero sin permisos
- Verifica que los roles se asignaron correctamente
- Haz login nuevamente para obtener token actualizado

---

## 📚 Documentación Completa

Ver `docs/API_GESTION_USUARIOS_ROLES.md` para documentación detallada de todos los endpoints.

¡Listo! Ahora puedes gestionar usuarios completamente desde el API 🚀

