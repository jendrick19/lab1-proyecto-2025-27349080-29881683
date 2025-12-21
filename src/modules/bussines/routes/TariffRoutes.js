const { Router } = require('express');

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

router.get('/', validateList, listHandler);
router.post('/', validateCreate, createHandler);
router.get('/activa/:prestacionCodigo', validateActiveTariff, getActiveHandler);
router.get('/:id', validateId, getHandler);
router.patch('/:id', validateUpdate, updateHandler);

module.exports = router;

