const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasPermission } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
} = require('../controllers/AuthorizationController');

const {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
} = require('../validators/AuthorizationValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar y obtener autorizaciones - Todos pueden leer
router.get('/', hasPermission('authorizations.read'), validateList, listHandler);
router.get('/:id', hasPermission('authorizations.read'), validateId, getHandler);

// Crear autorizaciones - Cajeros y administradores
router.post('/', hasPermission('authorizations.create'), validateCreate, createHandler);

// Actualizar autorizaciones - Cajeros y administradores
router.patch('/:id', hasPermission('authorizations.update'), validateUpdate, updateHandler);

module.exports = router;

