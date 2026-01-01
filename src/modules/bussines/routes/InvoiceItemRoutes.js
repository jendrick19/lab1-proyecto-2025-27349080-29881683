const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasAnyRole } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  listByInvoiceHandler,
  getHandler,
  createHandler,
  updateHandler,
  removeHandler,
} = require('../controllers/InvoiceItemController');

const {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
} = require('../validators/InvoiceItemValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar y obtener items de factura - Todos los autenticados pueden leer
router.get('/', validateList, listHandler);
router.get('/factura/:invoiceId', listByInvoiceHandler);
router.get('/:id', validateId, getHandler);

// Gestión de items - Administradores y cajeros
router.post('/factura/:invoiceId', hasAnyRole(['administrador', 'cajero']), validateCreate, createHandler);
router.patch('/:id', hasAnyRole(['administrador', 'cajero']), validateUpdate, updateHandler);
router.delete('/:id', hasAnyRole(['administrador', 'cajero']), validateId, removeHandler);

module.exports = router;

