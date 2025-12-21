const { Router } = require('express');

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

router.get('/', validateList, listHandler);
router.post('/', validateCreate, createHandler);
router.get('/factura/:invoiceId', validateInvoiceId, getByInvoiceHandler);
router.get('/factura/:invoiceId/saldo', validateInvoiceId, getPendingBalanceHandler);
router.get('/:id', validateId, getHandler);
router.patch('/:id', validateUpdate, updateHandler);

module.exports = router;

