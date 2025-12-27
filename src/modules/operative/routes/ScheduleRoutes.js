const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasPermission } = require('../../../shared/middlewares/authorizationMiddleware');

const {
    listHandler,
    getHandler,
    createHandler,
    updateHandler,
    deleteHandler,
} = require('../controllers/ScheduleController');

const {
    validateCreate,
    validateUpdate,
    validateId,
    validateList,
} = require('../validators/ScheduleValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar y obtener horarios - Todos pueden leer
router.get('/', hasPermission('schedules.read'), validateList, listHandler);
router.get('/:id', hasPermission('schedules.read'), validateId, getHandler);

// Crear horarios - Solo administradores
router.post('/', hasPermission('schedules.create'), validateCreate, createHandler);

// Actualizar horarios - Solo administradores
router.patch('/:id', hasPermission('schedules.update'), validateUpdate, updateHandler);

// Eliminar horarios - Solo administradores
router.delete('/:id', hasPermission('schedules.delete'), validateId, deleteHandler);

module.exports = router;
