const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasPermission } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler,
} = require('../controllers/InsurerController');

const {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
} = require('../validators/InsurerValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar y obtener aseguradoras - Todos pueden leer
router.get('/', hasPermission('insurers.read'), validateList, listHandler);
router.get('/:id', hasPermission('insurers.read'), validateId, getHandler);

// Crear aseguradoras - Solo administradores
router.post('/', hasPermission('insurers.create'), validateCreate, createHandler);

// Actualizar aseguradoras - Solo administradores
router.patch('/:id', hasPermission('insurers.update'), validateUpdate, updateHandler);

// Eliminar aseguradoras - Solo administradores
router.delete('/:id', hasPermission('insurers.delete'), validateId, deleteHandler);

module.exports = router;

