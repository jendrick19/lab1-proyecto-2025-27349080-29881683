const { Router } = require('express');
const {
  listHandler,
  getHandler,
  searchByPersonHandler,
  createHandler,
  updateHandler,
  closeHandler,
} = require('../controllers/episode.controller');
const {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
  validateSearchByPerson,
} = require('../validators/episode.validator');
const { episodeDiagnosisRouter } = require('./DiagnosisRouter');

const router = Router();

router.get('/persona', validateSearchByPerson, searchByPersonHandler);

router.get('/', validateList, listHandler);
router.post('/', validateCreate, createHandler);
router.get('/:id', validateId, getHandler);
router.patch('/:id', validateUpdate, updateHandler);

router.patch('/:id/cerrar', validateId, closeHandler);

router.use('/', episodeDiagnosisRouter);

module.exports = router;

