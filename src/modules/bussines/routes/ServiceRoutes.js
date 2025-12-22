const { Router } = require('express');

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

router.get('/', validateList, listHandler);
router.post('/', validateCreate, createHandler);
router.get('/:codigo', validateCode, getHandler);
router.patch('/:codigo', validateUpdate, updateHandler);

module.exports = router;

