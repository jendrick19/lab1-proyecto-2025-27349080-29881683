const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasPermission, hasAnyRole } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  getByEpisodeHandler,
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
  validatePrincipalByEpisode,
  validateChangePrincipal,
} = require('../validators/DiagnosisValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Solo profesionales, administradores y auditores pueden acceder a diagnósticos
router.use(hasAnyRole(['profesional', 'administrador', 'auditor']));

// Listar y obtener diagnósticos - Con permiso de lectura
router.get('/', hasPermission('diagnosis.read'), validateList, listHandler);
router.get('/:id', hasPermission('diagnosis.read'), validateId, getHandler);

// Crear diagnósticos - Profesionales y administradores
router.post('/', hasPermission('diagnosis.create'), validateCreate, createHandler);

// Actualizar diagnósticos - Profesionales y administradores
router.put('/:id', hasPermission('diagnosis.update'), validateUpdate, updateHandler);

// Eliminar diagnósticos - Profesionales y administradores
router.delete('/:id', hasPermission('diagnosis.delete'), validateId, deleteHandler);

// Router para diagnósticos dentro de episodios
const episodeDiagnosisRouter = Router();

episodeDiagnosisRouter.get('/:episodeId/diagnosticos', hasPermission('diagnosis.read'), validateEpisodeId, getByEpisodeHandler);
episodeDiagnosisRouter.get('/:episodeId/diagnosticos/principal', hasPermission('diagnosis.read'), validatePrincipalByEpisode, getPrincipalHandler);
episodeDiagnosisRouter.put('/:episodeId/diagnosticos/:diagnosisId/principal', hasPermission('diagnosis.update'), validateChangePrincipal, changePrincipalHandler);

module.exports = router;
module.exports.episodeDiagnosisRouter = episodeDiagnosisRouter;
