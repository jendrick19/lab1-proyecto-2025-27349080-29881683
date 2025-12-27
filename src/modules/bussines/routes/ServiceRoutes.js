const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { isAdmin } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
} = require('../controllers/ServiceController');

const {
  validateCreate,
  validateUpdate,
  validateCode,
  validateList,
} = require('../validators/ServiceValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar y obtener servicios - Todos los autenticados pueden leer
router.get('/', validateList, listHandler);
router.get('/:codigo', validateCode, getHandler);

// Gestión de servicios - Solo administradores
router.post('/', isAdmin, validateCreate, createHandler);
router.patch('/:codigo', isAdmin, validateUpdate, updateHandler);

module.exports = router;

