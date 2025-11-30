# Plan de Implementación de JWT con Sistema de Roles

## 📋 Resumen Ejecutivo

Este documento describe el plan completo para implementar autenticación JWT (JSON Web Tokens) en el proyecto, incluyendo un sistema de roles y permisos que permitirá controlar el acceso a los diferentes módulos y endpoints.

## 🎯 Objetivos

1. Implementar autenticación basada en JWT
2. Crear sistema de roles (Role) y asignación de roles a usuarios (UserRole)
3. Proteger endpoints con middleware de autenticación
4. Implementar control de acceso basado en roles (RBAC)
5. Crear endpoints de login, registro y refresh token

## 📦 Dependencias Necesarias

```json
{
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1",
  "dotenv": "^17.2.3" // Ya existe
}
```

## 🗄️ Estructura de Base de Datos

### 1. Tabla `Roles`
Almacena los diferentes roles del sistema (ej: ADMIN, PROFESSIONAL, PATIENT, etc.)

**Campos:**
- `id` (INT, PK, auto-increment)
- `name` (STRING, unique, not null) - ej: "ADMIN", "PROFESSIONAL"
- `description` (STRING, nullable)
- `status` (BOOLEAN, default: true)
- `createdAt` (DATE)
- `updatedAt` (DATE)

### 2. Tabla `UserRoles`
Tabla intermedia para la relación muchos-a-muchos entre Users y Roles

**Campos:**
- `id` (INT, PK, auto-increment)
- `userId` (INT, FK → Users.id)
- `roleId` (INT, FK → Roles.id)
- `assignedAt` (DATE, default: NOW)
- `assignedBy` (INT, FK → Users.id, nullable) - Quién asignó el rol
- `status` (BOOLEAN, default: true)
- `createdAt` (DATE)
- `updatedAt` (DATE)
- **Unique constraint:** (userId, roleId)

### 3. Modificaciones a la tabla `Users`
- Agregar campo `refreshToken` (STRING, nullable) para almacenar refresh tokens
- Agregar campo `lastLogin` (DATE, nullable) para tracking

## 📁 Estructura de Archivos a Crear

```
src/modules/platform/
├── models/
│   ├── user.js (modificar)
│   ├── role.js (nuevo)
│   └── userrole.js (nuevo)
├── controllers/
│   ├── AuthController.js (nuevo)
│   └── UserController.js (nuevo)
├── services/
│   ├── AuthService.js (nuevo)
│   ├── UserService.js (nuevo)
│   └── TokenService.js (nuevo)
├── repositories/
│   ├── UserRepository.js (nuevo)
│   └── RoleRepository.js (nuevo)
├── middlewares/
│   ├── authMiddleware.js (nuevo)
│   └── roleMiddleware.js (nuevo)
├── validators/
│   ├── AuthValidator.js (nuevo)
│   └── UserValidator.js (nuevo)
└── routes/
    ├── authRoutes.js (nuevo)
    └── index.js (modificar)
```

```
src/shared/
└── utils/
    └── passwordHelper.js (nuevo) - Para hash y verificación de passwords
```

```
database/migrations/
├── YYYYMMDDHHMMSS-create-role.js (nuevo)
├── YYYYMMDDHHMMSS-create-user-role.js (nuevo)
└── YYYYMMDDHHMMSS-add-refresh-token-to-user.js (nuevo)
```

## 🔧 Pasos de Implementación

### Fase 1: Preparación y Dependencias

1. **Instalar dependencias**
   ```bash
   npm install jsonwebtoken bcrypt
   ```

2. **Configurar variables de entorno** (.env)
   ```env
   JWT_SECRET=tu_secret_key_super_segura_aqui
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d
   JWT_ISSUER=clinica-api
   ```

### Fase 2: Modelos y Migraciones

3. **Crear migración para tabla Roles**
   - Definir campos: id, name, description, status

4. **Crear migración para tabla UserRoles**
   - Definir campos: id, userId, roleId, assignedAt, assignedBy, status
   - Agregar foreign keys y unique constraint

5. **Crear migración para modificar Users**
   - Agregar refreshToken (STRING, nullable)
   - Agregar lastLogin (DATE, nullable)

6. **Crear modelos Sequelize**
   - `src/modules/platform/models/role.js`
   - `src/modules/platform/models/userrole.js`
   - Modificar `src/modules/platform/models/user.js` para agregar relaciones

7. **Actualizar `database/models/index.js`**
   - Registrar los nuevos modelos

### Fase 3: Utilidades y Servicios Base

8. **Crear `src/shared/utils/passwordHelper.js`**
   - Función `hashPassword(password)` - Usa bcrypt
   - Función `comparePassword(password, hash)` - Verifica password

9. **Crear `src/modules/platform/services/TokenService.js`**
   - `generateAccessToken(userId, roles)` - Genera JWT access token
   - `generateRefreshToken(userId)` - Genera refresh token
   - `verifyToken(token)` - Verifica y decodifica token
   - `decodeToken(token)` - Decodifica sin verificar (para debugging)

10. **Crear Repositories**
    - `UserRepository.js` - Métodos para buscar usuarios, actualizar refreshToken
    - `RoleRepository.js` - Métodos para obtener roles, verificar roles de usuario

### Fase 4: Servicios de Negocio

11. **Crear `src/modules/platform/services/AuthService.js`**
    - `login(username, password)` - Autentica usuario y retorna tokens
    - `register(userData)` - Registra nuevo usuario
    - `refreshAccessToken(refreshToken)` - Genera nuevo access token
    - `logout(userId)` - Invalida refresh token
    - `validateCredentials(username, password)` - Valida credenciales

12. **Crear `src/modules/platform/services/UserService.js`**
    - Métodos para gestión de usuarios (si es necesario)

### Fase 5: Controladores y Validadores

13. **Crear `src/modules/platform/validators/AuthValidator.js`**
    - Validaciones para login (username, password requeridos)
    - Validaciones para registro
    - Validaciones para refresh token

14. **Crear `src/modules/platform/controllers/AuthController.js`**
    - `login(req, res, next)` - Maneja POST /auth/login
    - `register(req, res, next)` - Maneja POST /auth/register
    - `refreshToken(req, res, next)` - Maneja POST /auth/refresh
    - `logout(req, res, next)` - Maneja POST /auth/logout
    - `getCurrentUser(req, res, next)` - Maneja GET /auth/me

### Fase 6: Middlewares de Autenticación

15. **Crear `src/modules/platform/middlewares/authMiddleware.js`**
    - `authenticate` - Verifica JWT token en header Authorization
    - Extrae userId y roles del token
    - Agrega `req.user` con información del usuario autenticado

16. **Crear `src/modules/platform/middlewares/roleMiddleware.js`**
    - `requireRole(...roles)` - Middleware factory que verifica roles
    - Ejemplo: `requireRole('ADMIN', 'PROFESSIONAL')`

### Fase 7: Rutas

17. **Crear `src/modules/platform/routes/authRoutes.js`**
    - POST /login
    - POST /register
    - POST /refresh
    - POST /logout
    - GET /me (protegida)

18. **Modificar `src/modules/platform/routes/index.js`**
    - Agregar rutas de autenticación

19. **Modificar `src/modules/platform/index.js`**
    - Agregar ruta `/auth` para las rutas de autenticación

### Fase 8: Seeders y Datos Iniciales

20. **Crear seeder para Roles**
    - Roles básicos: ADMIN, PROFESSIONAL, PATIENT, RECEPTIONIST

21. **Crear seeder para usuario admin inicial**
    - Usuario admin con password hasheado
    - Asignar rol ADMIN

### Fase 9: Protección de Endpoints Existentes

22. **Aplicar middleware de autenticación a rutas existentes**
    - Revisar qué endpoints deben ser públicos vs protegidos
    - Aplicar `authMiddleware.authenticate` a rutas protegidas
    - Aplicar `roleMiddleware.requireRole` donde sea necesario

### Fase 10: Testing y Documentación

23. **Probar flujo completo:**
    - Registro de usuario
    - Login
    - Acceso a endpoint protegido
    - Refresh token
    - Logout
    - Verificación de roles

24. **Actualizar documentación OpenAPI**
    - Agregar esquemas de autenticación
    - Documentar endpoints de auth
    - Agregar ejemplos de uso

## 🔐 Flujo de Autenticación

### Login
1. Usuario envía `username` y `password`
2. Sistema busca usuario y verifica password con bcrypt
3. Sistema obtiene roles del usuario
4. Sistema genera:
   - Access Token (corta duración, ej: 1h)
   - Refresh Token (larga duración, ej: 7d)
5. Refresh token se guarda en BD (campo `refreshToken` del User)
6. Se retornan ambos tokens al cliente

### Acceso a Endpoint Protegido
1. Cliente envía request con header: `Authorization: Bearer <access_token>`
2. Middleware `authenticate` verifica token
3. Si es válido, extrae `userId` y `roles` del token
4. Agrega `req.user = { userId, roles }` al request
5. Continúa al siguiente middleware/controller

### Refresh Token
1. Cliente envía refresh token cuando access token expira
2. Sistema verifica refresh token contra BD
3. Si es válido, genera nuevo access token
4. Opcionalmente, genera nuevo refresh token (rotación)

### Logout
1. Cliente envía request de logout
2. Sistema elimina refresh token de BD
3. Cliente elimina tokens localmente

## 🎨 Estructura del JWT Payload

```json
{
  "userId": 1,
  "username": "admin",
  "roles": ["ADMIN"],
  "iat": 1234567890,
  "exp": 1234571490,
  "iss": "clinica-api"
}
```

## 📝 Ejemplo de Uso en Rutas

```javascript
// Ruta pública
router.post('/login', AuthController.login);

// Ruta protegida (requiere autenticación)
router.get('/profile', authMiddleware.authenticate, UserController.getProfile);

// Ruta protegida con rol específico
router.delete('/users/:id', 
  authMiddleware.authenticate, 
  roleMiddleware.requireRole('ADMIN'),
  UserController.deleteUser
);

// Ruta protegida con múltiples roles permitidos
router.get('/appointments', 
  authMiddleware.authenticate, 
  roleMiddleware.requireRole('ADMIN', 'PROFESSIONAL', 'RECEPTIONIST'),
  AppointmentController.list
);
```

## ⚠️ Consideraciones de Seguridad

1. **Passwords:**
   - Nunca almacenar passwords en texto plano
   - Usar bcrypt con salt rounds >= 10
   - Validar fortaleza de password en registro

2. **Tokens:**
   - Access tokens deben tener expiración corta (1h)
   - Refresh tokens deben tener expiración larga (7d)
   - Usar HTTPS en producción
   - Implementar rotación de refresh tokens

3. **Headers:**
   - Validar formato: `Authorization: Bearer <token>`
   - Manejar errores de token expirado/inválido

4. **Roles:**
   - Validar roles en cada request protegido
   - Implementar principio de menor privilegio

## 🚀 Orden de Implementación Recomendado

1. ✅ Instalar dependencias
2. ✅ Crear migraciones (Roles, UserRoles, modificar Users)
3. ✅ Crear modelos y relaciones
4. ✅ Crear utilidades (passwordHelper, TokenService)
5. ✅ Crear repositories
6. ✅ Crear servicios (AuthService)
7. ✅ Crear validadores
8. ✅ Crear controladores
9. ✅ Crear middlewares
10. ✅ Crear rutas
11. ✅ Crear seeders
12. ✅ Aplicar protección a rutas existentes
13. ✅ Testing

## 📊 Roles Sugeridos

- **ADMIN**: Acceso completo al sistema
- **PROFESSIONAL**: Médicos y profesionales de salud
- **RECEPTIONIST**: Personal de recepción
- **PATIENT**: Pacientes (si aplica)
- **NURSE**: Enfermeras
- **TECHNICIAN**: Técnicos de laboratorio

---

**Nota:** Este plan es una guía completa. Puedes implementarlo por fases y ajustar según las necesidades específicas de tu proyecto.

