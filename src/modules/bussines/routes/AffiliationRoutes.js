const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasAnyRole } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler,
} = require('../controllers/AffiliationController');

const {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
} = require('../validators/AffiliationValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar y obtener afiliaciones - Todos los autenticados pueden leer
router.get('/', validateList, listHandler);
router.get('/:id', validateId, getHandler);

// Gestión de afiliaciones - Administradores y cajeros
router.post('/', hasAnyRole(['administrador', 'cajero']), validateCreate, createHandler);
router.patch('/:id', hasAnyRole(['administrador', 'cajero']), validateUpdate, updateHandler);
router.delete('/:id', hasAnyRole(['administrador', 'cajero']), validateId, deleteHandler);

module.exports = router;

