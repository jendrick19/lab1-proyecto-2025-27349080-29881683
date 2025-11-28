const { Router } = require('express');
const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  closeHandler,
} = require('../controllers/EpisodeController');
const {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
} = require('../validators/EpisodeValidator');
const { episodeDiagnosisRouter } = require('./DiagnosisRouter');

const router = Router();

// Rutas CRUD estándar - usar query params para filtrar:
// ?nombrePaciente=Juan, ?documentoPaciente=V12345678, ?paciente=1, ?estado=abierto, ?tipo=consulta
// ?fechaDesde=2024-01-01, ?fechaHasta=2024-12-31
router.get('/', validateList, listHandler);
router.post('/', validateCreate, createHandler);
router.get('/:id', validateId, getHandler);
router.patch('/:id', validateUpdate, updateHandler);

// Ruta especial para cerrar episodio
router.patch('/:id/cerrar', validateId, closeHandler);

// Rutas anidadas para diagnósticos del episodio
router.use('/', episodeDiagnosisRouter);

module.exports = router;

