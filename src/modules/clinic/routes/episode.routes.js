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

const router = Router();

// Rutas de búsqueda por persona (deben ir antes de /:id)
router.get('/persona', validateSearchByPerson, searchByPersonHandler);

// Rutas CRUD estándar
router.get('/', validateList, listHandler);
router.post('/', validateCreate, createHandler);
router.get('/:id', validateId, getHandler);
router.patch('/:id', validateUpdate, updateHandler);

// Ruta específica para cerrar episodio
router.patch('/:id/cerrar', validateId, closeHandler);

module.exports = router;

