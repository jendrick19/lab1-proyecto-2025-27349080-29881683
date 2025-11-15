# Sistema de Códigos de Error HTTP

Este documento explica cómo funciona el sistema de manejo de errores HTTP en el módulo de Personas.

## Códigos HTTP Implementados

### ✅ 200 - OK
**Uso:** Solicitud exitosa
```json
{
  "codigo": 200,
  "mensaje": "Persona encontrada",
  "data": { ... }
}
```

### ✅ 201 - Created
**Uso:** Recurso creado exitosamente
```json
{
  "codigo": 201,
  "mensaje": "Persona creada exitosamente",
  "data": { ... }
}
```

### ❌ 400 - Bad Request
**Uso:** Errores de validación de datos de entrada (formato, tipo, longitud, etc.)

**Ejemplo:** Campo con formato inválido
```json
{
  "codigo": 400,
  "mensaje": "Errores de validación",
  "tipo": "ValidationError",
  "errores": [
    {
      "campo": "correo",
      "mensaje": "El correo debe ser una dirección válida",
      "valor": "correo-invalido"
    },
    {
      "campo": "telefono",
      "mensaje": "El teléfono debe contener entre 7 y 15 dígitos",
      "valor": "123"
    }
  ]
}
```

**Se usa cuando:**
- El email tiene formato inválido
- El teléfono no cumple con el patrón
- La fecha de nacimiento no es válida
- Los nombres/apellidos contienen caracteres no permitidos
- El tipo de documento no está en el enum permitido

### ❌ 404 - Not Found
**Uso:** Recurso no encontrado

**Ejemplo:**
```json
{
  "codigo": 404,
  "mensaje": "Persona no encontrada",
  "tipo": "NotFoundError"
}
```

**Se usa cuando:**
- Se busca una persona por ID que no existe
- Se intenta actualizar una persona que no existe
- Se intenta eliminar una persona que no existe

### ❌ 409 - Conflict
**Uso:** Conflicto con el estado actual del recurso (duplicados, restricciones únicas)

**Ejemplo 1:** Documento duplicado
```json
{
  "codigo": 409,
  "mensaje": "Conflicto: recurso duplicado",
  "tipo": "ConflictError",
  "errores": [
    {
      "campo": "numeroDocumento",
      "mensaje": "El número de documento ya está registrado",
      "valor": "12345678"
    }
  ]
}
```

**Ejemplo 2:** Error de constraint de base de datos
```json
{
  "codigo": 409,
  "mensaje": "El documentId '12345678' ya está registrado",
  "tipo": "ConflictError",
  "campo": "documentId"
}
```

**Se usa cuando:**
- Se intenta crear una persona con un número de documento que ya existe
- Se intenta actualizar un documento a uno que ya está en uso
- Hay violación de restricciones únicas en la base de datos
- Hay violación de claves foráneas

### ❌ 422 - Unprocessable Entity
**Uso:** Errores de lógica de negocio

**Ejemplo:**
```json
{
  "codigo": 422,
  "mensaje": "No se puede eliminar una persona con citas activas",
  "tipo": "BusinessLogicError"
}
```

**Se usa cuando:**
- La operación es técnicamente válida pero no tiene sentido en el contexto de negocio
- Se violan reglas de negocio específicas

### ❌ 500 - Internal Server Error
**Uso:** Errores internos del servidor

**Ejemplo (Producción):**
```json
{
  "codigo": 500,
  "mensaje": "Error interno del servidor",
  "tipo": "InternalError"
}
```

**Ejemplo (Desarrollo):**
```json
{
  "codigo": 500,
  "mensaje": "Error interno del servidor",
  "tipo": "InternalError",
  "detalle": "Connection timeout",
  "stack": "Error: Connection timeout\n    at ..."
}
```

**Se usa cuando:**
- Hay errores no esperados en el código
- Fallos de conexión a la base de datos
- Cualquier error no manejado específicamente

## Flujo de Manejo de Errores

```
┌─────────────────────────────────────────────────┐
│  1. Validador (express-validator)              │
│     - Valida formato y tipos de datos          │
│     - Verifica duplicados en BD                 │
│     ↓                                           │
│  Devuelve: 400 o 409                           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  2. Controlador                                 │
│     - Verifica existencia de recursos          │
│     - Lanza NotFoundError si no existe         │
│     ↓                                           │
│  Devuelve: 404                                 │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  3. Servicio/Repositorio                       │
│     - Ejecuta operaciones de BD                │
│     - Sequelize lanza errores                  │
│     ↓                                           │
│  Devuelve: Errores de Sequelize                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  4. Middleware errorHandler                     │
│     - Detecta tipo de error                    │
│     - Convierte a código HTTP apropiado        │
│     - Formatea respuesta                       │
│     ↓                                           │
│  Devuelve: 400, 404, 409, 422 o 500           │
└─────────────────────────────────────────────────┘
```

## Casos de Uso Específicos

### Crear una Persona

**Escenario 1:** Datos inválidos
```
POST /api/operative/agenda/personas
{
  "tipoDocumento": "INVALIDO",
  "numeroDocumento": "123"
}

→ 400 Bad Request (tipo de documento inválido, documento muy corto)
```

**Escenario 2:** Documento duplicado
```
POST /api/operative/agenda/personas
{
  "numeroDocumento": "12345678",  // Ya existe
  ...
}

→ 409 Conflict (documento ya registrado)
```

**Escenario 3:** Éxito
```
POST /api/operative/agenda/personas
{
  "tipoDocumento": "Cedula",
  "numeroDocumento": "99999999",
  ...
}

→ 201 Created
```

### Actualizar una Persona

**Escenario 1:** Persona no existe
```
PUT /api/operative/agenda/personas/99999

→ 404 Not Found
```

**Escenario 2:** Intentar usar documento de otra persona
```
PUT /api/operative/agenda/personas/1
{
  "numeroDocumento": "87654321"  // Pertenece a otra persona
}

→ 409 Conflict
```

**Escenario 3:** Éxito
```
PUT /api/operative/agenda/personas/1
{
  "telefono": "3001234567"
}

→ 200 OK
```

## Clases de Error Personalizadas

El sistema utiliza clases de error personalizadas ubicadas en `src/shared/errors/CustomErrors.js`:

- `ValidationError` → 400
- `NotFoundError` → 404
- `ConflictError` → 409
- `BusinessLogicError` → 422
- `InternalError` → 500

### Ejemplo de uso en código:

```javascript
const { NotFoundError, ConflictError } = require('../../../shared/errors/CustomErrors');

// Lanzar error 404
if (!person) {
  throw new NotFoundError('Persona no encontrada');
}

// Lanzar error 409
if (documentExists) {
  throw new ConflictError('El documento ya está registrado');
}
```

## Validaciones que Generan 409 (Conflict)

El validador detecta automáticamente conflictos cuando:

1. **Validación de documento único:**
   - Se verifica en la base de datos si el documento ya existe
   - En CREATE: busca cualquier documento igual
   - En UPDATE: busca documento igual excluyendo el registro actual

2. **Errores de Sequelize:**
   - `SequelizeUniqueConstraintError`: Violación de constraint UNIQUE
   - `SequelizeForeignKeyConstraintError`: Violación de clave foránea

## Configuración

El middleware de manejo de errores está configurado en `src/app.js`:

```javascript
const errorHandler = require('./modules/operative/agenda/middlewares/errorHandler');

// Al final de todos los middlewares y rutas
app.use(errorHandler);
```

## Ventajas del Sistema

✅ **Respuestas consistentes:** Todas las respuestas tienen el mismo formato  
✅ **Códigos semánticos:** Cada código representa exactamente el tipo de error  
✅ **Información detallada:** Los errores incluyen campos, mensajes y valores  
✅ **Detección automática:** Los duplicados se detectan antes de llegar a la BD  
✅ **Fácil debugging:** En desarrollo se incluye stack trace  
✅ **RESTful:** Sigue las mejores prácticas de APIs REST  

