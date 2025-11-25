const { Router } = require('express');
const {
  listHandler,
  getHandler,
  getByPeopleDocumentHandler,
  countByPeopleDocumentHandler,
  createHandler,
  updateHandler,
  deleteHandler,
} = require('../controllers/ConsentController');
const {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
  validateByPeopleDocument,
  validateCountByPeopleDocument,
} = require('../validators/ConsentValidator');

const router = Router();

// Rutas de búsqueda especializadas (deben ir antes de /:id)
router.get('/persona', validateByPeopleDocument, getByPeopleDocumentHandler);
router.get('/contar', validateCountByPeopleDocument, countByPeopleDocumentHandler);

// Rutas CRUD estándar
router.get('/', validateList, listHandler);
router.post('/', validateCreate, createHandler);
router.get('/:id', validateId, getHandler);
router.put('/:id', validateUpdate, updateHandler);
router.delete('/:id', validateId, deleteHandler);

module.exports = router;

