# Autenticación JWT y Bitácora de Accesos

## Descripción

Este proyecto implementa autenticación basada en **JSON Web Tokens (JWT)** y una **bitácora de accesos** que registra todas las peticiones al API.

## Características Implementadas

### 🔐 Autenticación JWT

- ✅ Registro de usuarios con hash de contraseñas (bcrypt)
- ✅ Login y generación de tokens JWT
- ✅ Access tokens (corta duración) y Refresh tokens (larga duración)
- ✅ Middleware de autenticación para proteger rutas
- ✅ Cambio de contraseña
- ✅ Obtención de información del usuario autenticado

### 📊 Bitácora de Accesos

La bitácora registra automáticamente todos los accesos al API con la siguiente información:

- **id**: Identificador único del registro
- **userId**: ID del usuario autenticado (null si no está autenticado)
- **recurso**: Endpoint accedido (ej: `/api/appointments`)
- **accion**: Método HTTP (GET, POST, PUT, DELETE, etc.)
- **ip**: Dirección IP del cliente
- **userAgent**: User Agent del navegador o cliente
- **statusCode**: Código de respuesta HTTP
- **responseTime**: Tiempo de respuesta en milisegundos
- **createdAt**: Fecha y hora del acceso

## Configuración

### Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# JWT Configuration
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

⚠️ **IMPORTANTE**: En producción, usa un secreto fuerte y único. Puedes generar uno con:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Migración de Base de Datos

La tabla `AccessLogs` se crea automáticamente al ejecutar las migraciones:

```bash
npx sequelize-cli db:migrate
```

## Endpoints de Autenticación

Base URL: `http://localhost:3000/api/platform/auth`

### 1. Registro de Usuario

Crea un nuevo usuario en el sistema.

**POST** `/register`

**Body:**
```json
{
  "username": "usuario123",
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "username": "usuario123",
      "email": "usuario@example.com",
      "status": true,
      "createdAt": "2025-12-27T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:3000/api/platform/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario123",
    "email": "usuario@example.com",
    "password": "password123"
  }'
```

### 2. Login

Autentica un usuario y obtiene tokens de acceso.

**POST** `/login`

**Body:**
```json
{
  "username": "usuario123",
  "password": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": 1,
      "username": "usuario123",
      "email": "usuario@example.com",
      "status": true,
      "createdAt": "2025-12-27T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario123",
    "password": "password123"
  }'
```

### 3. Refrescar Access Token

Genera un nuevo access token usando el refresh token.

**POST** `/refresh`

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Token refrescado exitosamente",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### 4. Obtener Usuario Actual (Protegida)

Obtiene la información del usuario autenticado.

**GET** `/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200):**
```json
{
  "message": "Usuario obtenido exitosamente",
  "data": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@example.com",
    "status": true,
    "createdAt": "2025-12-27T00:00:00.000Z",
    "updatedAt": "2025-12-27T00:00:00.000Z"
  }
}
```

**Ejemplo con cURL:**
```bash
curl -X GET http://localhost:3000/api/platform/auth/me \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

### 5. Cambiar Contraseña (Protegida)

Cambia la contraseña del usuario autenticado.

**POST** `/change-password`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

### 6. Logout (Protegida)

Cierra la sesión del usuario (nota: en JWT stateless, el logout es principalmente del lado del cliente).

**POST** `/logout`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200):**
```json
{
  "message": "Logout exitoso"
}
```

## Proteger Rutas Existentes

Para proteger cualquier ruta con autenticación JWT, simplemente aplica el middleware `authenticate`:

```javascript
const { authenticate } = require('../../../shared/middlewares/authMiddleware');

// Ruta protegida
router.get('/ruta-protegida', authenticate, miControlador);

// Ruta pública
router.get('/ruta-publica', miControlador);
```

### Ejemplo: Proteger rutas de appointments

```javascript
// En src/modules/operative/routes/AppointmentRoutes.js
const { authenticate } = require('../../../shared/middlewares/authMiddleware');

// Todas las rutas de appointments requieren autenticación
router.use(authenticate);

router.get('/', listHandler);
router.post('/', createHandler);
// ... etc
```

## Acceder al Usuario Autenticado

En cualquier controlador de una ruta protegida, puedes acceder al usuario autenticado:

```javascript
const miControlador = async (req, res) => {
  // El middleware authenticate adjunta el usuario al request
  const userId = req.userId;
  const user = req.user;
  
  console.log(`Usuario ${user.username} (ID: ${userId}) accedió a este endpoint`);
  
  // Tu lógica aquí...
};
```

## Bitácora de Accesos

La bitácora se registra automáticamente para todas las peticiones. No necesitas hacer nada adicional.

### Consultar la Bitácora

Puedes consultar los logs directamente desde la base de datos o crear un endpoint:

```javascript
const { AccessLog } = require('../../../database/models');

// Obtener logs recientes
const logs = await AccessLog.findAll({
  limit: 100,
  order: [['createdAt', 'DESC']],
  include: [{
    model: User,
    as: 'user',
    attributes: ['id', 'username', 'email']
  }]
});

// Logs de un usuario específico
const userLogs = await AccessLog.findAll({
  where: { userId: 1 },
  order: [['createdAt', 'DESC']]
});

// Logs por método HTTP
const postRequests = await AccessLog.findAll({
  where: { accion: 'POST' },
  order: [['createdAt', 'DESC']]
});
```

## Códigos de Error

### 400 Bad Request
- Datos incompletos o inválidos
- Contraseña muy corta

### 401 Unauthorized
- Token no proporcionado
- Token inválido o expirado
- Usuario o contraseña incorrectos
- Usuario inactivo

### 409 Conflict
- El usuario ya existe (en registro)

### 500 Internal Server Error
- Error del servidor

## Pruebas

### Script de Prueba Automático

Ejecuta el script de prueba para verificar que todo funciona:

```bash
npm run test:auth
```

Este script prueba:
- Registro de usuarios
- Login
- Verificación de tokens
- Refresh tokens
- Cambio de contraseña
- Consulta de bitácora

### Flujo de Prueba Manual

1. **Inicia el servidor:**
   ```bash
   npm run dev
   ```

2. **Registra un usuario:**
   ```bash
   curl -X POST http://localhost:3000/api/platform/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"test123"}'
   ```

3. **Guarda el accessToken de la respuesta**

4. **Accede a una ruta protegida:**
   ```bash
   curl -X GET http://localhost:3000/api/platform/auth/me \
     -H "Authorization: Bearer TU_ACCESS_TOKEN"
   ```

5. **Verifica la bitácora en la base de datos:**
   ```sql
   SELECT * FROM AccessLogs ORDER BY createdAt DESC LIMIT 10;
   ```

## Seguridad

### Recomendaciones

1. **Secreto JWT**: Usa un secreto fuerte y único en producción
2. **HTTPS**: Siempre usa HTTPS en producción para proteger los tokens
3. **Tiempo de expiración**: Ajusta los tiempos de expiración según tus necesidades
4. **Contraseñas**: Implementa validaciones de contraseña más estrictas en producción
5. **Rate limiting**: Considera agregar rate limiting para prevenir ataques de fuerza bruta
6. **Validación de entrada**: Siempre valida y sanitiza las entradas del usuario

### Almacenamiento de Tokens (Cliente)

**Recomendaciones para el frontend:**

- ✅ **Almacena el accessToken en memoria** (variable)
- ✅ **Almacena el refreshToken en httpOnly cookie** (más seguro)
- ❌ Evita localStorage para tokens sensibles (vulnerable a XSS)
- ✅ Implementa auto-refresh cuando el accessToken expire
- ✅ Limpia los tokens al hacer logout

## Arquitectura

```
src/
├── modules/
│   └── platform/
│       ├── controllers/
│       │   └── AuthController.js       # Controladores de autenticación
│       ├── services/
│       │   └── AuthService.js          # Lógica de negocio JWT
│       ├── routes/
│       │   └── AuthRoutes.js           # Rutas de autenticación
│       └── models/
│           ├── user.js                 # Modelo de usuario
│           └── accesslog.js            # Modelo de bitácora
└── shared/
    └── middlewares/
        ├── authMiddleware.js           # Middleware de autenticación
        └── accessLogMiddleware.js      # Middleware de bitácora

database/
└── migrations/
    └── XXXXXX-create-access-log.js     # Migración de AccessLogs
```

## Troubleshooting

### Error: "Token expirado"
- **Solución**: Usa el refresh token para obtener un nuevo access token

### Error: "Token inválido"
- **Solución**: Verifica que estás enviando el token en el formato correcto: `Bearer <token>`
- Asegúrate de que el token no esté corrupto o modificado

### Error: "Usuario o contraseña incorrectos"
- **Solución**: Verifica las credenciales. El username y password deben coincidir exactamente

### La bitácora no registra accesos
- **Solución**: Verifica que la migración se haya ejecutado correctamente
- Revisa los logs del servidor para ver si hay errores

## Referencias

- [JSON Web Tokens (JWT)](https://jwt.io/)
- [bcrypt para Node.js](https://www.npmjs.com/package/bcryptjs)
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)

