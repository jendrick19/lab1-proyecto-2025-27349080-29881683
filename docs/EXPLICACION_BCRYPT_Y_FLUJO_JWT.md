# 🔐 Explicación: bcrypt y Flujo Completo de JWT

## ¿Para qué es bcrypt?

### 🎯 Propósito Principal

**bcrypt** es una librería que se usa para **hashear (encriptar) contraseñas** de forma segura. Su función principal es:

1. **Nunca almacenar contraseñas en texto plano** en la base de datos
2. **Convertir la contraseña en un hash irreversible** que no se puede "desencriptar"
3. **Verificar contraseñas** comparando el hash almacenado con el hash de la contraseña ingresada

### 🔒 ¿Por qué es importante?

**❌ SIN bcrypt (INSEGURO):**
```
Usuario: admin
Password: miPassword123

En la BD se guarda:
passwordHash: "miPassword123"  ← ¡Cualquiera que vea la BD puede leer la contraseña!
```

**✅ CON bcrypt (SEGURO):**
```
Usuario: admin
Password: miPassword123

En la BD se guarda:
passwordHash: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
              ↑ Este hash es único y no se puede revertir a "miPassword123"
```

### 🔧 ¿Cómo funciona bcrypt?

#### 1. **Al Registrar un Usuario (Hash)**
```javascript
const bcrypt = require('bcrypt');

// Usuario ingresa: "miPassword123"
const password = "miPassword123";

// Generamos el hash (esto toma tiempo intencionalmente para seguridad)
const saltRounds = 10; // Número de rondas (más rondas = más seguro pero más lento)
const passwordHash = await bcrypt.hash(password, saltRounds);

// Resultado: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
// Este hash se guarda en la BD en el campo passwordHash
```

#### 2. **Al Hacer Login (Verificación)**
```javascript
// Usuario intenta login con: "miPassword123"
const passwordIngresada = "miPassword123";

// Obtenemos el hash de la BD
const passwordHashDeBD = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

// Comparamos
const esCorrecta = await bcrypt.compare(passwordIngresada, passwordHashDeBD);

if (esCorrecta) {
  console.log("✅ Contraseña correcta!");
} else {
  console.log("❌ Contraseña incorrecta");
}
```

### 🛡️ Características de Seguridad de bcrypt

1. **Hash único cada vez**: Aunque uses la misma contraseña, bcrypt genera un hash diferente cada vez (gracias al "salt")
2. **Irreversible**: No puedes obtener la contraseña original desde el hash
3. **Lento intencionalmente**: Está diseñado para ser lento (100-200ms) para prevenir ataques de fuerza bruta
4. **Salt automático**: Incluye un "salt" aleatorio en cada hash para mayor seguridad

---

## 🔄 Flujo Completo de JWT: Desde el Inicio de Sesión

### 📱 Escenario: Usuario quiere acceder a la aplicación

---

## **PASO 1: REGISTRO (Primera vez)**

### 1.1. Usuario se registra
```
POST /api/platform/auth/register
{
  "username": "doctor123",
  "email": "doctor@clinica.com",
  "password": "miPasswordSegura123"
}
```

### 1.2. Backend procesa el registro
```javascript
// 1. Validar datos (username único, email válido, password fuerte)
// 2. Hashear la contraseña con bcrypt
const passwordHash = await bcrypt.hash("miPasswordSegura123", 10);
// Resultado: "$2b$10$abc123..."

// 3. Crear usuario en BD
const nuevoUsuario = await User.create({
  username: "doctor123",
  email: "doctor@clinica.com",
  passwordHash: "$2b$10$abc123...", // ← Hash, NO la contraseña original
  status: true
});

// 4. Asignar rol por defecto (ej: PROFESSIONAL)
await UserRole.create({
  userId: nuevoUsuario.id,
  roleId: 2 // ID del rol PROFESSIONAL
});

// 5. Retornar respuesta
res.status(201).json({
  mensaje: "Usuario registrado exitosamente",
  userId: nuevoUsuario.id
});
```

**Estado en la BD:**
```
Users:
id: 1
username: "doctor123"
email: "doctor@clinica.com"
passwordHash: "$2b$10$abc123..." ← Hash, no la contraseña original
status: true

UserRoles:
userId: 1
roleId: 2 (PROFESSIONAL)
```

---

## **PASO 2: LOGIN (Inicio de Sesión)**

### 2.1. Usuario intenta iniciar sesión
```
POST /api/platform/auth/login
{
  "username": "doctor123",
  "password": "miPasswordSegura123"
}
```

### 2.2. Backend valida credenciales
```javascript
// 1. Buscar usuario por username
const usuario = await User.findOne({ 
  where: { username: "doctor123" } 
});

if (!usuario) {
  return res.status(401).json({ mensaje: "Credenciales inválidas" });
}

// 2. Verificar contraseña con bcrypt
const passwordCorrecta = await bcrypt.compare(
  "miPasswordSegura123",           // ← Contraseña que ingresó el usuario
  usuario.passwordHash              // ← Hash almacenado en BD
);

if (!passwordCorrecta) {
  return res.status(401).json({ mensaje: "Credenciales inválidas" });
}

// 3. Obtener roles del usuario
const roles = await UserRole.findAll({
  where: { userId: usuario.id, status: true },
  include: [{ model: Role }]
});

const roleNames = roles.map(r => r.Role.name); // ["PROFESSIONAL"]
```

### 2.3. Backend genera tokens JWT
```javascript
// 4. Generar Access Token (válido por 1 hora)
const accessToken = jwt.sign(
  {
    userId: usuario.id,
    username: usuario.username,
    roles: roleNames // ["PROFESSIONAL"]
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '1h',
    issuer: 'clinica-api'
  }
);

// 5. Generar Refresh Token (válido por 7 días)
const refreshToken = jwt.sign(
  {
    userId: usuario.id,
    type: 'refresh'
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '7d',
    issuer: 'clinica-api'
  }
);

// 6. Guardar refresh token en BD
await usuario.update({
  refreshToken: refreshToken,
  lastLogin: new Date()
});
```

### 2.4. Backend retorna tokens al cliente
```javascript
res.json({
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  expiresIn: 3600, // segundos (1 hora)
  tokenType: "Bearer"
});
```

**Estado en la BD:**
```
Users:
id: 1
username: "doctor123"
refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." ← Guardado
lastLogin: "2025-01-15 10:30:00"
```

### 2.5. Cliente almacena tokens
```javascript
// En el frontend (React, Vue, etc.)
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('refreshToken', response.refreshToken);
```

---

## **PASO 3: ACCESO A ENDPOINT PROTEGIDO**

### 3.1. Usuario quiere ver sus citas
```
GET /api/operative/appointments
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.2. Middleware de autenticación verifica el token
```javascript
// authMiddleware.js
const authenticate = async (req, res, next) => {
  try {
    // 1. Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ mensaje: "Token no proporcionado" });
    }

    const token = authHeader.split(' ')[1]; // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

    // 2. Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = {
    //   userId: 1,
    //   username: "doctor123",
    //   roles: ["PROFESSIONAL"],
    //   iat: 1234567890,
    //   exp: 1234571490
    // }

    // 3. Verificar que el token no haya expirado (jwt.verify lo hace automáticamente)
    // Si expiró, lanza error

    // 4. Agregar información del usuario al request
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      roles: decoded.roles
    };

    // 5. Continuar al siguiente middleware/controller
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ mensaje: "Token expirado" });
    }
    return res.status(401).json({ mensaje: "Token inválido" });
  }
};
```

### 3.3. Middleware de roles verifica permisos (opcional)
```javascript
// roleMiddleware.js
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user ya tiene los roles del paso anterior
    const userRoles = req.user.roles; // ["PROFESSIONAL"]

    // Verificar si el usuario tiene alguno de los roles permitidos
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ 
        mensaje: "No tienes permisos para acceder a este recurso" 
      });
    }

    next();
  };
};
```

### 3.4. Controller procesa la petición
```javascript
// AppointmentController.js
const listAppointments = async (req, res, next) => {
  try {
    // req.user está disponible gracias al middleware
    const userId = req.user.userId; // 1
    const roles = req.user.roles; // ["PROFESSIONAL"]

    // Lógica de negocio: obtener citas del usuario
    const appointments = await AppointmentService.getByUserId(userId);

    res.json({
      data: appointments,
      usuario: req.user.username
    });
  } catch (error) {
    next(error);
  }
};
```

---

## **PASO 4: TOKEN EXPIRADO - REFRESH TOKEN**

### 4.1. Access token expira (después de 1 hora)
```
GET /api/operative/appointments
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (EXPIRADO)
```

### 4.2. Backend rechaza el token
```javascript
// authMiddleware detecta que el token expiró
catch (error) {
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      mensaje: "Token expirado",
      code: "TOKEN_EXPIRED"
    });
  }
}
```

### 4.3. Cliente solicita nuevo access token
```
POST /api/platform/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4.4. Backend valida refresh token
```javascript
// AuthController.refreshToken
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // 1. Verificar que el refresh token sea válido
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // 2. Buscar usuario y verificar que el refresh token coincida con el de BD
    const usuario = await User.findOne({
      where: {
        id: decoded.userId,
        refreshToken: refreshToken // ← Debe coincidir con el guardado
      }
    });

    if (!usuario) {
      return res.status(401).json({ mensaje: "Refresh token inválido" });
    }

    // 3. Obtener roles actualizados
    const roles = await UserRole.findAll({
      where: { userId: usuario.id, status: true },
      include: [{ model: Role }]
    });
    const roleNames = roles.map(r => r.Role.name);

    // 4. Generar nuevo access token
    const newAccessToken = jwt.sign(
      {
        userId: usuario.id,
        username: usuario.username,
        roles: roleNames
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
        issuer: 'clinica-api'
      }
    );

    // 5. Retornar nuevo access token
    res.json({
      accessToken: newAccessToken,
      expiresIn: 3600
    });
  } catch (error) {
    return res.status(401).json({ mensaje: "Refresh token inválido" });
  }
};
```

### 4.5. Cliente actualiza el access token
```javascript
// Frontend actualiza el token
localStorage.setItem('accessToken', response.accessToken);

// Y vuelve a intentar la petición original
```

---

## **PASO 5: LOGOUT**

### 5.1. Usuario cierra sesión
```
POST /api/platform/auth/logout
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5.2. Backend invalida refresh token
```javascript
// AuthController.logout
const logout = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Del middleware de autenticación

    // Eliminar refresh token de BD
    await User.update(
      { refreshToken: null },
      { where: { id: userId } }
    );

    res.json({ mensaje: "Sesión cerrada exitosamente" });
  } catch (error) {
    next(error);
  }
};
```

### 5.3. Cliente elimina tokens localmente
```javascript
// Frontend
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

**Estado en la BD:**
```
Users:
id: 1
refreshToken: null ← Ya no tiene refresh token válido
```

---

## 📊 Diagrama de Flujo Visual

```
┌─────────────┐
│   USUARIO   │
└──────┬──────┘
       │
       │ 1. POST /auth/login
       │    { username, password }
       ▼
┌─────────────────────┐
│   BACKEND LOGIN     │
│ 1. Buscar usuario   │
│ 2. bcrypt.compare() │ ← Verifica contraseña
│ 3. Obtener roles    │
│ 4. Generar tokens   │
└──────┬──────────────┘
       │
       │ 2. Retorna tokens
       ▼
┌─────────────┐
│   CLIENTE   │
│ Guarda:     │
│ - accessToken│
│ - refreshToken│
└──────┬──────┘
       │
       │ 3. GET /appointments
       │    Authorization: Bearer <token>
       ▼
┌─────────────────────┐
│  AUTH MIDDLEWARE    │
│ 1. Extrae token     │
│ 2. jwt.verify()     │ ← Verifica token
│ 3. Agrega req.user  │
└──────┬──────────────┘
       │
       │ 4. Si tiene rol correcto
       ▼
┌─────────────────────┐
│  ROLE MIDDLEWARE    │
│ Verifica permisos   │
└──────┬──────────────┘
       │
       │ 5. Continúa
       ▼
┌─────────────────────┐
│   CONTROLLER        │
│ Procesa petición    │
│ Usa req.user        │
└──────┬──────────────┘
       │
       │ 6. Respuesta
       ▼
┌─────────────┐
│   CLIENTE   │
│ Recibe data │
└─────────────┘
```

---

## 🔑 Puntos Clave del Flujo

1. **bcrypt** se usa SOLO para:
   - Hashear contraseñas al registrarse
   - Verificar contraseñas al hacer login
   - NO se usa para tokens JWT

2. **JWT** se usa para:
   - Autenticación sin estado (stateless)
   - No requiere consultar BD en cada request (solo verificar firma)
   - Contiene información del usuario (userId, roles)

3. **Refresh Token** se guarda en BD para:
   - Poder invalidarlo en logout
   - Verificar que sigue siendo válido
   - Rotación de tokens

4. **Access Token** NO se guarda en BD porque:
   - Es stateless (sin estado)
   - Si expira, se renueva con refresh token
   - Es más rápido (no consulta BD)

---

¿Te queda claro el flujo? ¿Quieres que proceda con la implementación?

