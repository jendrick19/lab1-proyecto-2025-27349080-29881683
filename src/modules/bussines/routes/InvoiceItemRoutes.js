const { Router } = require('express');

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

router.get('/', validateList, listHandler);
router.get('/factura/:invoiceId', listByInvoiceHandler);
router.post('/factura/:invoiceId', validateCreate, createHandler);
router.get('/:id', validateId, getHandler);
router.patch('/:id', validateUpdate, updateHandler);
router.delete('/:id', validateId, removeHandler);

module.exports = router;

