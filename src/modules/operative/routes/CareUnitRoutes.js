const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { isAdmin } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler,
} = require('../controllers/CareUnitController');

const {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
} = require('../validators/CareUnitValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar y obtener unidades de atención - Todos los autenticados pueden leer
router.get('/', validateList, listHandler);
router.get('/:id', validateId, getHandler);

// Gestión de unidades - Solo administradores
router.post('/', isAdmin, validateCreate, createHandler);
router.patch('/:id', isAdmin, validateUpdate, updateHandler);
router.delete('/:id', isAdmin, validateId, deleteHandler);

module.exports = router;
