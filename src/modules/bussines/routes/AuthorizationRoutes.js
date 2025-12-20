const { Router } = require('express');

const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
} = require('../controllers/AuthorizationController');

const {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
} = require('../validators/AuthorizationValidator');

const router = Router();

router.get('/', validateList, listHandler);
router.post('/', validateCreate, createHandler);
router.get('/:id', validateId, getHandler);
router.patch('/:id', validateUpdate, updateHandler);

module.exports = router;

