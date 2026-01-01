const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasPermission } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  getByInvoiceHandler,
  getPendingBalanceHandler,
  createHandler,
  updateHandler,
} = require('../controllers/PaymentController');

const {
  validateCreate,
  validateUpdate,
  validateId,
  validateInvoiceId,
  validateList,
} = require('../validators/PaymentValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar y obtener pagos - Todos los roles autenticados pueden leer
router.get('/', hasPermission('payments.read'), validateList, listHandler);
router.get('/factura/:invoiceId', hasPermission('payments.read'), validateInvoiceId, getByInvoiceHandler);
router.get('/factura/:invoiceId/saldo', hasPermission('payments.read'), validateInvoiceId, getPendingBalanceHandler);
router.get('/:id', hasPermission('payments.read'), validateId, getHandler);

// Crear pagos - Cajeros y administradores
router.post('/', hasPermission('payments.create'), validateCreate, createHandler);

// Actualizar pagos - Cajeros y administradores
router.patch('/:id', hasPermission('payments.update'), validateUpdate, updateHandler);

module.exports = router;

