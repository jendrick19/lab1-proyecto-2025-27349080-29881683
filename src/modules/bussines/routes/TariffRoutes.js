const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { isAdmin } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  getActiveHandler,
  createHandler,
  updateHandler,
} = require('../controllers/TariffController');

const {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
  validateActiveTariff,
} = require('../validators/TariffValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar y obtener tarifas - Todos los autenticados pueden leer
router.get('/', validateList, listHandler);
router.get('/activa/:prestacionCodigo', validateActiveTariff, getActiveHandler);
router.get('/:id', validateId, getHandler);

// Gestión de tarifas - Solo administradores
router.post('/', isAdmin, validateCreate, createHandler);
router.patch('/:id', isAdmin, validateUpdate, updateHandler);

module.exports = router;

