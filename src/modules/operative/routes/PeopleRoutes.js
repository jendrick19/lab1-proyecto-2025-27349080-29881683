const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasPermission } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler,
} = require('../controllers/PeopleController');

const {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
} = require('../validators/PeopleValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar y obtener pacientes - Todos los roles autenticados pueden leer
router.get('/', hasPermission('patients.read'), validateList, listHandler);
router.get('/:id', hasPermission('patients.read'), validateId, getHandler);

// Crear pacientes - Profesionales y administradores
router.post('/', hasPermission('patients.create'), validateCreate, createHandler);

// Actualizar pacientes - Profesionales y administradores
router.patch('/:id', hasPermission('patients.update'), validateUpdate, updateHandler);

// Eliminar pacientes - Solo administradores
router.delete('/:id', hasPermission('patients.delete'), validateId, deleteHandler);

module.exports = router;
