# Ejemplo Práctico: Proteger Rutas del Módulo Clínico

Esta guía muestra cómo aplicar el sistema de roles y permisos al módulo clínico (clinic) de forma práctica y completa.

## Escenario

Queremos proteger las rutas de **Notas Clínicas** (Clinical Notes) con los siguientes requisitos:

- **Listar y ver**: Solo profesionales y administradores
- **Crear**: Solo profesionales y administradores (con permiso `clinicalNotes.create`)
- **Modificar**: Solo el profesional que creó la nota o administradores
- **Eliminar**: Solo administradores

## Paso 1: Actualizar las Rutas

Archivo: `src/modules/clinic/routes/ClinicalNoteRoutes.js`

```javascript
const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { 
  hasAnyRole,
  hasPermission,
  isAdmin
} = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler
} = require('../controllers/ClinicalNoteController');

const router = Router();

// =====================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// =====================================
router.use(authenticate);

// =====================================
// LISTAR NOTAS CLÍNICAS
// Acceso: profesionales y administradores
// =====================================
router.get('/', 
  hasAnyRole(['profesional', 'administrador']),
  listHandler
);

// =====================================
// VER UNA NOTA ESPECÍFICA
// Acceso: quien tenga permiso de lectura
// =====================================
router.get('/:id', 
  hasPermission('clinicalNotes.read'),
  getHandler
);

// =====================================
// CREAR NOTA CLÍNICA
// Acceso: quien tenga permiso de creación
// =====================================
router.post('/', 
  hasPermission('clinicalNotes.create'),
  createHandler
);

// =====================================
// ACTUALIZAR NOTA CLÍNICA
// Acceso: quien tenga permiso de actualización
// La validación de "solo el autor o admin" se hace en el controlador
// =====================================
router.put('/:id', 
  hasPermission('clinicalNotes.update'),
  updateHandler
);

// =====================================
// ELIMINAR NOTA CLÍNICA
// Acceso: solo administradores
// =====================================
router.delete('/:id', 
  isAdmin,
  deleteHandler
);

module.exports = router;
```

## Paso 2: Implementar Lógica en el Controlador

Archivo: `src/modules/clinic/controllers/ClinicalNoteController.js`

```javascript
const ClinicalNoteService = require('../services/ClinicalNoteService');
const { isAdmin } = require('../../../shared/utils/permissionHelper');

/**
 * Listar notas clínicas
 * Profesionales solo ven sus notas, administradores ven todas
 */
const listHandler = async (req, res) => {
  try {
    const user = req.user;
    const filters = { ...req.query };
    
    // Si no es administrador, filtrar solo sus notas
    if (!isAdmin(user)) {
      filters.professionalId = user.id;
    }
    
    const result = await ClinicalNoteService.list(filters);
    
    res.json({
      message: 'Notas clínicas obtenidas exitosamente',
      data: result.notes,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error al listar notas:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener notas clínicas'
    });
  }
};

/**
 * Obtener una nota específica
 * Validar que el usuario tenga acceso a esta nota
 */
const getHandler = async (req, res) => {
  try {
    const user = req.user;
    const noteId = req.params.id;
    
    const note = await ClinicalNoteService.findById(noteId);
    
    if (!note) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Nota clínica no encontrada'
      });
    }
    
    // Verificar acceso: solo el creador o administrador pueden ver
    if (!isAdmin(user) && note.professionalId !== user.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permiso para ver esta nota clínica'
      });
    }
    
    res.json({
      message: 'Nota clínica obtenida exitosamente',
      data: note
    });
  } catch (error) {
    console.error('Error al obtener nota:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener nota clínica'
    });
  }
};

/**
 * Crear nota clínica
 */
const createHandler = async (req, res) => {
  try {
    const user = req.user;
    
    // Asignar automáticamente el profesional que crea la nota
    const noteData = {
      ...req.body,
      professionalId: user.id,
      createdBy: user.id
    };
    
    const note = await ClinicalNoteService.create(noteData);
    
    res.status(201).json({
      message: 'Nota clínica creada exitosamente',
      data: note
    });
  } catch (error) {
    console.error('Error al crear nota:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al crear nota clínica'
    });
  }
};

/**
 * Actualizar nota clínica
 * Solo el creador o administrador pueden modificar
 */
const updateHandler = async (req, res) => {
  try {
    const user = req.user;
    const noteId = req.params.id;
    
    const note = await ClinicalNoteService.findById(noteId);
    
    if (!note) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Nota clínica no encontrada'
      });
    }
    
    // Verificar que solo el creador o admin puedan modificar
    if (!isAdmin(user) && note.professionalId !== user.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo el profesional que creó la nota o un administrador pueden modificarla'
      });
    }
    
    const updatedNote = await ClinicalNoteService.update(noteId, {
      ...req.body,
      updatedBy: user.id
    });
    
    res.json({
      message: 'Nota clínica actualizada exitosamente',
      data: updatedNote
    });
  } catch (error) {
    console.error('Error al actualizar nota:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al actualizar nota clínica'
    });
  }
};

/**
 * Eliminar nota clínica
 * Solo administradores (validado en ruta)
 */
const deleteHandler = async (req, res) => {
  try {
    const noteId = req.params.id;
    
    const note = await ClinicalNoteService.findById(noteId);
    
    if (!note) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Nota clínica no encontrada'
      });
    }
    
    await ClinicalNoteService.delete(noteId);
    
    res.json({
      message: 'Nota clínica eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar nota:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al eliminar nota clínica'
    });
  }
};

module.exports = {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler
};
```

## Paso 3: Probar el Sistema

### 1. Crear usuarios con diferentes roles

```bash
# Usuario profesional
curl -X POST http://localhost:3000/api/platform/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "drgarcia",
    "email": "drgarcia@clinica.com",
    "password": "secure123"
  }'

# Asignar rol de profesional
npm run assign:role drgarcia profesional

# Usuario administrador
curl -X POST http://localhost:3000/api/platform/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@clinica.com",
    "password": "admin123"
  }'

# Asignar rol de administrador
npm run assign:role admin administrador

# Usuario cajero (sin acceso clínico)
curl -X POST http://localhost:3000/api/platform/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "cajero1",
    "email": "cajero@clinica.com",
    "password": "cajero123"
  }'

# Asignar rol de cajero
npm run assign:role cajero1 cajero
```

### 2. Obtener tokens

```bash
# Login como profesional
TOKEN_PROF=$(curl -s -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"drgarcia","password":"secure123"}' \
  | jq -r '.data.accessToken')

# Login como administrador
TOKEN_ADMIN=$(curl -s -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.accessToken')

# Login como cajero
TOKEN_CAJERO=$(curl -s -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"cajero1","password":"cajero123"}' \
  | jq -r '.data.accessToken')
```

### 3. Probar accesos

#### ✅ Profesional crea nota (debe funcionar)

```bash
curl -X POST http://localhost:3000/api/clinic/clinical-notes \
  -H "Authorization: Bearer $TOKEN_PROF" \
  -H "Content-Type: application/json" \
  -d '{
    "episodeId": 1,
    "noteType": "consulta",
    "content": "Paciente presenta mejoría...",
    "observations": "Continuar tratamiento"
  }'
```

**Respuesta esperada (201):**
```json
{
  "message": "Nota clínica creada exitosamente",
  "data": {
    "id": 1,
    "episodeId": 1,
    "professionalId": 1,
    "noteType": "consulta",
    "content": "Paciente presenta mejoría...",
    ...
  }
}
```

#### ✅ Profesional lista sus notas (debe funcionar)

```bash
curl -X GET http://localhost:3000/api/clinic/clinical-notes \
  -H "Authorization: Bearer $TOKEN_PROF"
```

#### ✅ Administrador ve todas las notas (debe funcionar)

```bash
curl -X GET http://localhost:3000/api/clinic/clinical-notes \
  -H "Authorization: Bearer $TOKEN_ADMIN"
```

#### ❌ Cajero intenta acceder a notas clínicas (debe fallar con 403)

```bash
curl -X GET http://localhost:3000/api/clinic/clinical-notes \
  -H "Authorization: Bearer $TOKEN_CAJERO"
```

**Respuesta esperada (403):**
```json
{
  "error": "Acceso denegado",
  "message": "Se requiere uno de los siguientes roles: profesional, administrador"
}
```

#### ❌ Profesional intenta eliminar nota (debe fallar con 403)

```bash
curl -X DELETE http://localhost:3000/api/clinic/clinical-notes/1 \
  -H "Authorization: Bearer $TOKEN_PROF"
```

**Respuesta esperada (403):**
```json
{
  "error": "Acceso denegado",
  "message": "Se requiere el rol 'administrador' para acceder a este recurso"
}
```

#### ✅ Administrador elimina nota (debe funcionar)

```bash
curl -X DELETE http://localhost:3000/api/clinic/clinical-notes/1 \
  -H "Authorization: Bearer $TOKEN_ADMIN"
```

**Respuesta esperada (200):**
```json
{
  "message": "Nota clínica eliminada exitosamente"
}
```

## Paso 4: Agregar Auditoría

Opcional: Registrar quién modificó cada nota:

```javascript
// Agregar campos createdBy y updatedBy en la migración
await queryInterface.addColumn('ClinicalNotes', 'createdBy', {
  type: Sequelize.INTEGER,
  references: { model: 'Users', key: 'id' },
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL'
});

await queryInterface.addColumn('ClinicalNotes', 'updatedBy', {
  type: Sequelize.INTEGER,
  references: { model: 'Users', key: 'id' },
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL'
});

// En el controlador, registrar el usuario
const note = await ClinicalNoteService.create({
  ...req.body,
  createdBy: req.userId,
  updatedBy: req.userId
});
```

## Resumen de Protección Aplicada

| Acción | Endpoint | Método | Rol Requerido | Permiso Requerido |
|--------|----------|--------|---------------|-------------------|
| Listar | `/clinical-notes` | GET | profesional, administrador | - |
| Ver | `/clinical-notes/:id` | GET | - | `clinicalNotes.read` |
| Crear | `/clinical-notes` | POST | - | `clinicalNotes.create` |
| Actualizar | `/clinical-notes/:id` | PUT | - | `clinicalNotes.update` + ser autor o admin |
| Eliminar | `/clinical-notes/:id` | DELETE | administrador | - |

## Aplicar a Otros Recursos

Este mismo patrón se puede aplicar a:
- Episodes (Episodios)
- Diagnosis (Diagnósticos)
- Orders (Órdenes médicas)
- Results (Resultados)
- Consents (Consentimientos)

Solo necesitas ajustar:
1. Los nombres de permisos (ej: `episodes.read`, `diagnosis.create`)
2. Los roles permitidos según el recurso
3. La lógica de filtrado en los controladores

## Consejos

1. **Siempre autenticar primero**: `authenticate` debe ser el primer middleware
2. **Usar permisos específicos**: Prefiere `hasPermission('resource.action')` sobre `hasRole()`
3. **Validar en controlador**: Para lógica compleja (ej: "solo el autor"), valida en el controlador
4. **Mensajes claros**: Indica qué permiso o rol falta en los mensajes de error
5. **Auditoría**: Registra quién crea/modifica registros usando `req.userId`

¡El módulo clínico ahora está completamente protegido con el sistema de roles y permisos!

