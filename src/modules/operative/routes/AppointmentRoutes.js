const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasPermission, hasAnyPermission } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler,
} = require('../controllers/AppointmentController');

const {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
} = require('../validators/AppointmentValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar y obtener citas - Todos los roles autenticados pueden leer
router.get('/', hasPermission('appointments.read'), validateList, listHandler);
router.get('/:id', hasPermission('appointments.read'), validateId, getHandler);

// Crear citas - Profesionales y administradores
router.post('/', hasPermission('appointments.create'), validateCreate, createHandler);

// Actualizar citas - Profesionales y administradores
router.patch('/:id', hasPermission('appointments.update'), validateUpdate, updateHandler);

// Eliminar citas - Solo administradores
router.delete('/:id', hasPermission('appointments.delete'), validateId, deleteHandler);

module.exports = router;
