const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasPermission } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  recalculateHandler,
} = require('../controllers/InvoiceController');

const {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
} = require('../validators/InvoiceValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar y obtener facturas - Todos los roles autenticados pueden leer
router.get('/', hasPermission('invoices.read'), validateList, listHandler);
router.get('/:id', hasPermission('invoices.read'), validateId, getHandler);

// Crear facturas - Cajeros y administradores
router.post('/', hasPermission('invoices.create'), validateCreate, createHandler);

// Actualizar facturas - Cajeros y administradores
router.patch('/:id', hasPermission('invoices.update'), validateUpdate, updateHandler);
router.post('/:id/recalcular', hasPermission('invoices.update'), validateId, recalculateHandler);

module.exports = router;

