# Cómo Proteger Rutas con JWT

Esta guía te muestra cómo proteger las rutas existentes de tu API con el middleware de autenticación JWT.

## Opciones de Protección

### Opción 1: Proteger Todas las Rutas de un Módulo

Si quieres que **todas** las rutas de un módulo requieran autenticación:

```javascript
const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { 
  listHandler, 
  getHandler, 
  createHandler,
  updateHandler,
  deleteHandler 
} = require('../controllers/MiController');

const router = Router();

// Aplicar autenticación a TODAS las rutas de este router
router.use(authenticate);

// Todas estas rutas ahora requieren autenticación
router.get('/', listHandler);
router.get('/:id', getHandler);
router.post('/', createHandler);
router.put('/:id', updateHandler);
router.delete('/:id', deleteHandler);

module.exports = router;
```

### Opción 2: Proteger Rutas Específicas

Si solo quieres proteger algunas rutas específicas:

```javascript
const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { 
  listHandler, 
  getHandler, 
  createHandler,
  updateHandler,
  deleteHandler 
} = require('../controllers/MiController');

const router = Router();

// Rutas públicas (sin autenticación)
router.get('/', listHandler);           // Público
router.get('/:id', getHandler);         // Público

// Rutas protegidas (requieren autenticación)
router.post('/', authenticate, createHandler);       // Protegido
router.put('/:id', authenticate, updateHandler);     // Protegido
router.delete('/:id', authenticate, deleteHandler);  // Protegido

module.exports = router;
```

### Opción 3: Autenticación Opcional

Si quieres que una ruta funcione con o sin autenticación (pero use el usuario si está disponible):

```javascript
const { Router } = require('express');
const { optionalAuthenticate } = require('../../../shared/middlewares/authMiddleware');
const { listHandler } = require('../controllers/MiController');

const router = Router();

// Si el usuario está autenticado, req.user estará disponible
// Si no, req.user será undefined pero la ruta seguirá funcionando
router.get('/', optionalAuthenticate, listHandler);

module.exports = router;
```

## Ejemplos Prácticos

### Ejemplo 1: Proteger Appointments (Operative Module)

**Archivo:** `src/modules/operative/routes/AppointmentRoutes.js`

```javascript
const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler,
  changeStatusHandler
} = require('../controllers/AppointmentController');
const {
  validateCreate,
  validateUpdate,
  validateList,
  validateChangeStatus,
  validateId
} = require('../validators/AppointmentValidator');

const router = Router();

// OPCIÓN A: Proteger todas las rutas
router.use(authenticate);

// O OPCIÓN B: Proteger individualmente
// Consulta - Público
router.get('/', validateList, listHandler);
router.get('/:id', validateId, getHandler);

// Modificación - Solo autenticados
router.post('/', authenticate, validateCreate, createHandler);
router.put('/:id', authenticate, validateId, validateUpdate, updateHandler);
router.delete('/:id', authenticate, validateId, deleteHandler);
router.patch('/:id/status', authenticate, validateId, validateChangeStatus, changeStatusHandler);

module.exports = router;
```

### Ejemplo 2: Proteger Clinical Notes (Clinic Module)

**Archivo:** `src/modules/clinic/routes/ClinicalNoteRoutes.js`

```javascript
const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler
} = require('../controllers/ClinicalNoteController');

const router = Router();

// Todas las notas clínicas requieren autenticación
router.use(authenticate);

router.get('/', listHandler);
router.get('/:id', getHandler);
router.post('/', createHandler);
router.put('/:id', updateHandler);

module.exports = router;
```

### Ejemplo 3: Proteger Invoices (Business Module)

**Archivo:** `src/modules/bussines/routes/InvoiceRoutes.js`

```javascript
const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler
} = require('../controllers/InvoiceController');

const router = Router();

// Las facturas requieren autenticación
router.use(authenticate);

router.get('/', listHandler);
router.get('/:id', getHandler);
router.post('/', createHandler);
router.put('/:id', updateHandler);
router.delete('/:id', deleteHandler);

module.exports = router;
```

## Usar el Usuario Autenticado en los Controladores

Una vez que aplicas el middleware `authenticate`, el usuario autenticado está disponible en `req.user` y `req.userId`:

```javascript
const createAppointmentHandler = async (req, res) => {
  try {
    // Obtener el usuario autenticado
    const userId = req.userId;
    const user = req.user;
    
    console.log(`Usuario ${user.username} está creando una cita`);
    
    // Usar el userId en tu lógica
    const appointment = await AppointmentService.create({
      ...req.body,
      createdBy: userId  // Registrar quién creó el registro
    });
    
    res.status(201).json({
      message: 'Cita creada exitosamente',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error al crear cita',
      message: error.message
    });
  }
};
```

## Agregar Campo `createdBy` a tus Modelos (Opcional)

Si quieres rastrear qué usuario creó o modificó registros, agrega estos campos:

### 1. Crear Migración

```bash
npx sequelize-cli migration:generate --name add-audit-fields-to-appointments
```

### 2. Editar la Migración

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Appointments', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('Appointments', 'updatedBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Appointments', 'createdBy');
    await queryInterface.removeColumn('Appointments', 'updatedBy');
  }
};
```

### 3. Actualizar el Modelo

```javascript
// En src/modules/operative/models/appointment.js
Appointment.init({
  // ... campos existentes
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Appointment',
});

// Agregar asociaciones
static associate(models) {
  // ... asociaciones existentes
  
  Appointment.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
  
  Appointment.belongsTo(models.User, {
    foreignKey: 'updatedBy',
    as: 'updater'
  });
}
```

### 4. Usar en el Controlador

```javascript
const createAppointmentHandler = async (req, res) => {
  try {
    const appointment = await AppointmentService.create({
      ...req.body,
      createdBy: req.userId,  // Usuario que creó
      updatedBy: req.userId   // Usuario que modificó por última vez
    });
    
    res.status(201).json({
      message: 'Cita creada exitosamente',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error al crear cita',
      message: error.message
    });
  }
};

const updateAppointmentHandler = async (req, res) => {
  try {
    const appointment = await AppointmentService.update(req.params.id, {
      ...req.body,
      updatedBy: req.userId  // Usuario que modificó
    });
    
    res.json({
      message: 'Cita actualizada exitosamente',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error al actualizar cita',
      message: error.message
    });
  }
};
```

## Verificar Permisos Específicos

Si necesitas verificar permisos específicos (más allá de estar autenticado):

```javascript
// Middleware personalizado
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      // Aquí implementarías tu lógica de permisos
      // Por ejemplo, verificar roles del usuario
      if (!user.hasPermission(permission)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'No tienes permisos para realizar esta acción'
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({
        error: 'Error al verificar permisos',
        message: error.message
      });
    }
  };
};

// Uso
router.delete('/:id', 
  authenticate,                    // Primero autenticar
  checkPermission('delete_appointments'),  // Luego verificar permiso
  deleteHandler
);
```

## Probar las Rutas Protegidas

### 1. Sin Token (Debe fallar con 401)

```bash
curl -X GET http://localhost:3000/api/operative/appointments
```

**Respuesta esperada:**
```json
{
  "error": "No autorizado",
  "message": "Token de autenticación no proporcionado"
}
```

### 2. Con Token (Debe funcionar)

```bash
# Primero obtén un token
TOKEN=$(curl -X POST http://localhost:3000/api/platform/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}' \
  | jq -r '.data.accessToken')

# Úsalo en la petición
curl -X GET http://localhost:3000/api/operative/appointments \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Con Token Expirado (Debe fallar con 401)

```bash
curl -X GET http://localhost:3000/api/operative/appointments \
  -H "Authorization: Bearer token_expirado_aqui"
```

**Respuesta esperada:**
```json
{
  "error": "No autorizado",
  "message": "Token expirado",
  "code": "TOKEN_EXPIRED"
}
```

## Checklist de Implementación

Para proteger un módulo completo:

- [ ] Importar el middleware `authenticate`
- [ ] Aplicar el middleware a las rutas deseadas
- [ ] Actualizar los controladores para usar `req.userId` y `req.user`
- [ ] (Opcional) Agregar campos `createdBy` y `updatedBy` a los modelos
- [ ] (Opcional) Actualizar las migraciones y modelos
- [ ] Probar con y sin token
- [ ] Verificar que la bitácora registra los accesos correctamente

## Resumen

1. **Importa el middleware:**
   ```javascript
   const { authenticate } = require('../../../shared/middlewares/authMiddleware');
   ```

2. **Aplícalo a tus rutas:**
   ```javascript
   router.use(authenticate);  // Todas las rutas
   // O
   router.get('/', authenticate, handler);  // Ruta específica
   ```

3. **Usa el usuario en tus controladores:**
   ```javascript
   const userId = req.userId;
   const user = req.user;
   ```

4. **¡Listo!** Tu ruta ahora está protegida y registrada en la bitácora.

## Siguientes Pasos

- Implementar roles y permisos
- Crear middleware para verificar roles específicos
- Implementar token blacklist para logout real
- Agregar rate limiting para prevenir ataques
- Implementar refresh token rotation

