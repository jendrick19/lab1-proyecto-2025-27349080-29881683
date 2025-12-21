const { Router } = require('express');

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

router.get('/', validateList, listHandler);
router.post('/', validateCreate, createHandler);
router.get('/:id', validateId, getHandler);
router.patch('/:id', validateUpdate, updateHandler);
router.post('/:id/recalcular', validateId, recalculateHandler);

module.exports = router;

