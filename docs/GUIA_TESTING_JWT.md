# 🧪 Guía de Testing - JWT Authentication

## 📋 Prerequisitos

1. ✅ Migraciones ejecutadas: `npx sequelize-cli db:migrate`
2. ✅ Seeders ejecutados: `npm run seed:cli`
3. ✅ Servidor corriendo: `npm run dev` o `npm start`
4. ✅ Variables de entorno configuradas en `.env`:
   ```env
   JWT_SECRET=tu_secret_key_super_segura_aqui
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d
   JWT_ISSUER=clinica-api
   ```

## 🔑 Credenciales de Prueba

### Usuario Admin
- **Username:** `admin`
- **Password:** `admin123`
- **Rol:** ADMIN (todos los permisos)

### Usuarios Profesionales
- **Username:** `juangarcia1`, `mariarodriguez2`, etc.
- **Password:** (necesitas actualizar el passwordHash en BD o crear uno nuevo)
- **Rol:** PROFESSIONAL

---

## 🚀 Paso a Paso de Testing

### **PASO 1: Registrar un Nuevo Usuario**

**Endpoint:** `POST /api/platform/auth/register`

**Request:**
```bash
curl -X POST http://localhost:3000/api/platform/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

**Response esperado (201):**
```json
{
  "codigo": 201,
  "mensaje": "Usuario registrado exitosamente",
  "data": {
    "id": 21,
    "username": "testuser",
    "email": "test@example.com",
    "status": true
  }
}
```

**✅ Verificación:** Usuario creado sin contraseña en texto plano.

---

### **PASO 2: Login con Usuario Admin**

**Endpoint:** `POST /api/platform/auth/login`

**Request:**
```bash
curl -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response esperado (200):**
```json
{
  "codigo": 200,
  "mensaje": "Inicio de sesión exitoso",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@clinica.com",
      "roles": ["ADMIN"]
    }
  }
}
```

**✅ Verificación:**
- ✅ Recibes `accessToken` y `refreshToken`
- ✅ El usuario tiene roles: `["ADMIN"]`
- ✅ El token es válido (puedes decodificarlo en jwt.io)

**💾 Guarda el `accessToken` para los siguientes pasos:**
```bash
# Ejemplo (ajusta según tu respuesta)
export ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### **PASO 3: Obtener Usuario Actual (Endpoint Protegido)**

**Endpoint:** `GET /api/platform/auth/me`

**Request:**
```bash
curl -X GET http://localhost:3000/api/platform/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Response esperado (200):**
```json
{
  "codigo": 200,
  "mensaje": "Usuario obtenido exitosamente",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@clinica.com",
    "status": true,
    "roles": ["ADMIN"],
    "lastLogin": "2025-11-30T10:30:00.000Z",
    "creationDate": "2025-11-30T10:00:00.000Z"
  }
}
```

**✅ Verificación:**
- ✅ El endpoint requiere autenticación
- ✅ Retorna información del usuario autenticado
- ✅ Incluye los roles del usuario

---

### **PASO 4: Probar Sin Token (Debe Fallar)**

**Request:**
```bash
curl -X GET http://localhost:3000/api/platform/auth/me
```

**Response esperado (401):**
```json
{
  "codigo": 401,
  "mensaje": "Token de autenticación no proporcionado",
  "tipo": "UnauthorizedError"
}
```

**✅ Verificación:** El middleware rechaza requests sin token.

---

### **PASO 5: Probar con Token Inválido (Debe Fallar)**

**Request:**
```bash
curl -X GET http://localhost:3000/api/platform/auth/me \
  -H "Authorization: Bearer token_invalido_12345"
```

**Response esperado (401):**
```json
{
  "codigo": 401,
  "mensaje": "Token inválido",
  "tipo": "JsonWebTokenError"
}
```

**✅ Verificación:** El middleware rechaza tokens inválidos.

---

### **PASO 6: Refresh Token (Renovar Access Token)**

**Endpoint:** `POST /api/platform/auth/refresh`

**Request:**
```bash
curl -X POST http://localhost:3000/api/platform/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "'$REFRESH_TOKEN'"
  }'
```

**Response esperado (200):**
```json
{
  "codigo": 200,
  "mensaje": "Token renovado exitosamente",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

**✅ Verificación:**
- ✅ Obtienes un nuevo `accessToken`
- ✅ El refresh token sigue siendo válido

**💾 Actualiza el ACCESS_TOKEN:**
```bash
export ACCESS_TOKEN="nuevo_token_aqui"
```

---

### **PASO 7: Logout**

**Endpoint:** `POST /api/platform/auth/logout`

**Request:**
```bash
curl -X POST http://localhost:3000/api/platform/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Response esperado (200):**
```json
{
  "codigo": 200,
  "mensaje": "Sesión cerrada exitosamente"
}
```

**✅ Verificación:**
- ✅ El logout funciona correctamente
- ✅ El refresh token se elimina de la BD

---

### **PASO 8: Probar Refresh Token Después de Logout (Debe Fallar)**

**Request:**
```bash
curl -X POST http://localhost:3000/api/platform/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "'$REFRESH_TOKEN'"
  }'
```

**Response esperado (401):**
```json
{
  "codigo": 401,
  "mensaje": "Refresh token no encontrado",
  "tipo": "UnauthorizedError"
}
```

**✅ Verificación:** El refresh token ya no es válido después del logout.

---

### **PASO 9: Probar Middleware de Roles**

Para probar esto, necesitas proteger una ruta con `requireRole`. Vamos a crear un ejemplo:

**Crear una ruta de prueba protegida:**

Agrega esto temporalmente en `src/modules/platform/routes/authRoutes.js`:

```javascript
const { requireRole } = require('../middlewares/roleMiddleware');

// Ruta de prueba para ADMIN
router.get('/test-admin', authenticate, requireRole('ADMIN'), (req, res) => {
  res.json({
    codigo: 200,
    mensaje: 'Acceso permitido - Solo ADMIN',
    user: req.user
  });
});

// Ruta de prueba para PROFESSIONAL
router.get('/test-professional', authenticate, requireRole('PROFESSIONAL'), (req, res) => {
  res.json({
    codigo: 200,
    mensaje: 'Acceso permitido - Solo PROFESSIONAL',
    user: req.user
  });
});
```

**Test 1: Acceso como ADMIN (Debe funcionar)**

```bash
# Primero hacer login como admin y obtener token
curl -X GET http://localhost:3000/api/platform/auth/test-admin \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Response esperado (200):**
```json
{
  "codigo": 200,
  "mensaje": "Acceso permitido - Solo ADMIN",
  "user": {
    "userId": 1,
    "username": "admin",
    "roles": ["ADMIN"]
  }
}
```

**Test 2: Intentar acceder como PROFESSIONAL (Debe fallar)**

Si intentas acceder a `/test-admin` con un usuario que no es ADMIN:

**Response esperado (403):**
```json
{
  "codigo": 403,
  "mensaje": "No tienes permisos para acceder a este recurso. Roles requeridos: ADMIN",
  "tipo": "ForbiddenError"
}
```

---

### **PASO 10: Probar Token Expirado**

Para probar esto, necesitas esperar 1 hora o modificar temporalmente `JWT_EXPIRES_IN` a algo muy corto como `10s`.

**Modifica `.env` temporalmente:**
```env
JWT_EXPIRES_IN=10s
```

**Luego:**
1. Haz login
2. Espera 10 segundos
3. Intenta usar el token

**Response esperado (401):**
```json
{
  "codigo": 401,
  "mensaje": "Token expirado",
  "tipo": "TokenExpiredError",
  "code": "TOKEN_EXPIRED"
}
```

**✅ Verificación:** El sistema detecta tokens expirados correctamente.

---

## 📝 Checklist de Verificación

- [ ] ✅ Registro de usuario funciona
- [ ] ✅ Login genera tokens correctamente
- [ ] ✅ Access token permite acceder a endpoints protegidos
- [ ] ✅ Sin token → Error 401
- [ ] ✅ Token inválido → Error 401
- [ ] ✅ Refresh token renueva access token
- [ ] ✅ Logout invalida refresh token
- [ ] ✅ Middleware de roles funciona (ADMIN puede, otros no)
- [ ] ✅ Token expirado → Error 401
- [ ] ✅ Roles se incluyen en el JWT payload
- [ ] ✅ Usuario admin tiene rol ADMIN
- [ ] ✅ Usuarios profesionales tienen rol PROFESSIONAL

---

## 🔧 Comandos Útiles para Testing

### Usar Postman o Insomnia

1. **Crear Collection:**
   - POST `/api/platform/auth/register`
   - POST `/api/platform/auth/login`
   - GET `/api/platform/auth/me` (con token)
   - POST `/api/platform/auth/refresh`
   - POST `/api/platform/auth/logout`

2. **Configurar Variables:**
   - `base_url`: `http://localhost:3000`
   - `access_token`: (se actualiza después de login)
   - `refresh_token`: (se actualiza después de login)

3. **Usar Pre-request Scripts:**
   ```javascript
   // Para agregar token automáticamente
   pm.request.headers.add({
     key: 'Authorization',
     value: 'Bearer ' + pm.environment.get('access_token')
   });
   ```

---

## 🐛 Troubleshooting

### Error: "Token de autenticación no proporcionado"
- ✅ Verifica que el header sea: `Authorization: Bearer <token>`
- ✅ No olvides el espacio después de "Bearer"

### Error: "Token inválido"
- ✅ Verifica que `JWT_SECRET` esté configurado correctamente
- ✅ Asegúrate de usar el token completo (no cortado)

### Error: "Refresh token no encontrado"
- ✅ Verifica que el refresh token esté guardado en la BD
- ✅ Verifica que no hayas hecho logout antes

### Los roles no aparecen en el token
- ✅ Verifica que el usuario tenga roles asignados en `UserRoles`
- ✅ Verifica que los roles existan en la tabla `Roles`

---

## 📊 Verificar en Base de Datos

### Verificar usuario admin:
```sql
SELECT u.id, u.username, u.email, r.name as role
FROM Users u
LEFT JOIN UserRoles ur ON ur.userId = u.id
LEFT JOIN Roles r ON r.id = ur.roleId
WHERE u.username = 'admin';
```

### Verificar refresh token:
```sql
SELECT id, username, refreshToken, lastLogin
FROM Users
WHERE username = 'admin';
```

### Verificar roles de un usuario:
```sql
SELECT u.username, r.name as role
FROM Users u
JOIN UserRoles ur ON ur.userId = u.id
JOIN Roles r ON r.id = ur.roleId
WHERE u.username = 'admin';
```

---

¡Listo! Con estos pasos deberías poder verificar que todo el sistema JWT funciona correctamente. 🎉

