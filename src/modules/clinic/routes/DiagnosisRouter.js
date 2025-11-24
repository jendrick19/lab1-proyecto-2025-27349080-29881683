const { Router } = require('express');
const {
  listHandler,
  getHandler,
  getByEpisodeHandler,
  searchByCodeHandler,
  getByTypeHandler,
  getPrincipalHandler,
  createHandler,
  updateHandler,
  changePrincipalHandler,
  deleteHandler,
} = require('../controllers/DiagnosisController');
const {
  validateCreate,
  validateUpdate,
  validateId,
  validateEpisodeId,
  validateList,
  validateSearchByCode,
  validateType,
  validatePrincipalByEpisode,
  validateChangePrincipal,
} = require('../validators/DiagnosisValidator');

const router = Router();

// Rutas de búsqueda especializadas (deben ir antes de /:id)
router.get('/buscar/codigo', validateSearchByCode, searchByCodeHandler);
router.get('/tipo/:type', validateType, getByTypeHandler);

// Rutas CRUD estándar
router.get('/', validateList, listHandler);
router.post('/', validateCreate, createHandler);
router.get('/:id', validateId, getHandler);
router.put('/:id', validateUpdate, updateHandler);
router.delete('/:id', validateId, deleteHandler);

// Router para rutas anidadas en episodios
const episodeDiagnosisRouter = Router();

// Rutas anidadas: /api/clinic/episodios/:episodeId/diagnosticos
episodeDiagnosisRouter.get('/:episodeId/diagnosticos', validateEpisodeId, getByEpisodeHandler);
episodeDiagnosisRouter.get('/:episodeId/diagnosticos/principal', validatePrincipalByEpisode, getPrincipalHandler);
episodeDiagnosisRouter.put('/:episodeId/diagnosticos/:diagnosisId/principal', validateChangePrincipal, changePrincipalHandler);

module.exports = router;
module.exports.episodeDiagnosisRouter = episodeDiagnosisRouter;

