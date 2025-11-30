# 🚀 Guía Rápida: Cómo Usar el Sistema JWT

## 📋 Paso a Paso Completo

### **PASO 1: Iniciar el Servidor**

```bash
npm run dev
```

Deberías ver algo como:
```
Servidor corriendo en puerto 3000
```

---

### **PASO 2: Iniciar Sesión (Login)**

**Endpoint:** `POST http://localhost:3000/api/platform/auth/login`

**Con curl:**
```bash
curl -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"admin\", \"password\": \"admin123\"}"
```

**Con PowerShell (Windows):**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/platform/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username": "admin", "password": "admin123"}'
```

**Respuesta esperada:**
```json
{
  "codigo": 200,
  "mensaje": "Inicio de sesión exitoso",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJBRE1JTiJdLCJpYXQiOjE3MzI5ODc2MDAsImV4cCI6MTczMjk5MTIwMCwiaXNzIjoiY2xpbmljYS1hcGkifQ.xxxxx",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzMyOTg3NjAwLCJleHAiOjE3MzM1OTE2MDAsImlzcyI6ImNsaW5pY2EtYXBpIn0.xxxxx",
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

**💾 IMPORTANTE:** Copia el `accessToken` y el `refreshToken` de la respuesta.

---

### **PASO 3: Guardar el Token (Opcional pero Recomendado)**

**En PowerShell:**
```powershell
# Guardar el token en una variable
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/platform/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username": "admin", "password": "admin123"}'

$token = $response.data.accessToken
$refreshToken = $response.data.refreshToken

# Ver el token
Write-Host "Access Token: $token"
```

**En Bash/Linux/Mac:**
```bash
# Guardar el token en una variable
TOKEN=$(curl -s -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' | jq -r '.data.accessToken')

echo "Token: $TOKEN"
```

---

### **PASO 4: Usar el Token para Acceder a Rutas Protegidas**

Ahora que tienes el token, puedes usarlo en todas las rutas protegidas.

#### **Ejemplo 1: Ver Episodios (Clinic)**

**Con curl:**
```bash
curl http://localhost:3000/api/clinic/episodios/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Con PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/clinic/episodios/" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $token"}
```

#### **Ejemplo 2: Ver Citas (Operative)**

**Con curl:**
```bash
curl http://localhost:3000/api/operative/citas/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Con PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/operative/citas/" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $token"}
```

#### **Ejemplo 3: Ver Profesionales**

**Con curl:**
```bash
curl http://localhost:3000/api/operative/profesionales/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Con PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/operative/profesionales/" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $token"}
```

#### **Ejemplo 4: Ver Mi Información**

**Con curl:**
```bash
curl http://localhost:3000/api/platform/auth/me \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Con PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/platform/auth/me" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $token"}
```

---

### **PASO 5: Renovar el Token (Refresh Token)**

Cuando el access token expire (después de 1 hora), usa el refresh token:

**Con curl:**
```bash
curl -X POST http://localhost:3000/api/platform/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"TU_REFRESH_TOKEN_AQUI\"}"
```

**Con PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/platform/auth/refresh" `
  -Method POST `
  -ContentType "application/json" `
  -Body "{`"refreshToken`": `"$refreshToken`"}"
```

**Respuesta:**
```json
{
  "codigo": 200,
  "mensaje": "Token renovado exitosamente",
  "data": {
    "accessToken": "nuevo_token_aqui",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

---

### **PASO 6: Cerrar Sesión (Logout)**

**Con curl:**
```bash
curl -X POST http://localhost:3000/api/platform/auth/logout \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Con PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/platform/auth/logout" `
  -Method POST `
  -Headers @{"Authorization" = "Bearer $token"}
```

---

## 📝 Ejemplo Completo en PowerShell

```powershell
# 1. Login
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/platform/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username": "admin", "password": "admin123"}'

# 2. Guardar token
$token = $loginResponse.data.accessToken
Write-Host "✅ Login exitoso! Token guardado."

# 3. Usar el token para ver episodios
$episodios = Invoke-RestMethod -Uri "http://localhost:3000/api/clinic/episodios/" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $token"}

Write-Host "✅ Episodios obtenidos:"
$episodios | ConvertTo-Json -Depth 3

# 4. Ver mi información
$miInfo = Invoke-RestMethod -Uri "http://localhost:3000/api/platform/auth/me" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $token"}

Write-Host "✅ Mi información:"
$miInfo | ConvertTo-Json
```

---

## 🌐 Usando Postman o Insomnia

### **Configuración en Postman:**

1. **Crear una nueva Collection:**
   - Nombre: "Clínica API"

2. **Configurar Variables de Collection:**
   - `base_url`: `http://localhost:3000`
   - `access_token`: (se actualizará después de login)

3. **Crear Request: Login**
   - Method: `POST`
   - URL: `{{base_url}}/api/platform/auth/login`
   - Body (raw JSON):
     ```json
     {
       "username": "admin",
       "password": "admin123"
     }
     ```
   - **Tests Tab (para guardar token automáticamente):**
     ```javascript
     if (pm.response.code === 200) {
       const jsonData = pm.response.json();
       pm.collectionVariables.set("access_token", jsonData.data.accessToken);
       pm.collectionVariables.set("refresh_token", jsonData.data.refreshToken);
     }
     ```

4. **Crear Request: Ver Episodios**
   - Method: `GET`
   - URL: `{{base_url}}/api/clinic/episodios/`
   - Headers:
     - `Authorization`: `Bearer {{access_token}}`

5. **Configurar Authorization Global (Opcional):**
   - En la Collection, ve a "Authorization"
   - Type: `Bearer Token`
   - Token: `{{access_token}}`
   - Esto aplicará automáticamente a todas las requests

---

## 🔑 Credenciales de Prueba

### Usuario Admin
- **Username:** `admin`
- **Password:** `admin123`
- **Rol:** ADMIN

### Usuarios Profesionales
Los usuarios del seeder tienen passwords hasheados que no funcionan. Para probar:
1. Crea un nuevo usuario con `/auth/register`
2. O actualiza el password de un usuario existente en la BD

---

## 🧪 Flujo Completo de Prueba

```bash
# 1. Login
curl -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# 2. Copiar el accessToken de la respuesta y usarlo:
# (Reemplaza YOUR_TOKEN con el token real)

# 3. Ver episodios
curl http://localhost:3000/api/clinic/episodios/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Ver citas
curl http://localhost:3000/api/operative/citas/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Ver profesionales
curl http://localhost:3000/api/operative/profesionales/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# 6. Ver mi información
curl http://localhost:3000/api/platform/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# 7. Logout
curl -X POST http://localhost:3000/api/platform/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚠️ Errores Comunes

### Error 401: "Token de autenticación no proporcionado"
- ✅ Verifica que el header sea: `Authorization: Bearer <token>`
- ✅ No olvides el espacio después de "Bearer"
- ✅ Verifica que el token no esté cortado

### Error 401: "Token inválido"
- ✅ Verifica que el token sea el correcto
- ✅ Verifica que `JWT_SECRET` esté configurado en `.env`
- ✅ El token puede haber expirado (usa refresh token)

### Error 401: "Token expirado"
- ✅ Usa el refresh token para obtener un nuevo access token
- ✅ O haz login nuevamente

---

## 📚 Endpoints Disponibles

### Públicos (sin token):
- `POST /api/platform/auth/login`
- `POST /api/platform/auth/register`
- `POST /api/platform/auth/refresh`
- `GET /api/clinic/health`
- `GET /api/operative/health`
- `GET /api/bussines/health`

### Protegidos (requieren token):
- `GET /api/clinic/episodios/`
- `GET /api/clinic/notas-clinicas/`
- `GET /api/clinic/diagnosticos/`
- `GET /api/clinic/consentimientos/`
- `GET /api/operative/personas/`
- `GET /api/operative/profesionales/`
- `GET /api/operative/citas/`
- `GET /api/operative/agendas/`
- `GET /api/operative/unid-atencion/`
- `GET /api/platform/auth/me`
- `POST /api/platform/auth/logout`
- `GET /api/bussines/billing/*`

---

¡Listo! Con esta guía puedes usar todas las rutas del sistema. 🎉

