const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasPermission, hasAnyRole } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  getVersionHistoryHandler,
  getVersionHandler,
  getLatestVersionHandler,
  compareVersionsHandler,
} = require('../controllers/ClinicalNoteController');

const {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
  validateVersionId,
  validateCompareVersions,
} = require('../validators/ClinicalNoteValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Solo profesionales, administradores y auditores pueden acceder a notas clínicas
router.use(hasAnyRole(['profesional', 'administrador', 'auditor']));

// Listar y obtener notas clínicas - Con permiso de lectura
router.get('/', hasPermission('clinicalNotes.read'), validateList, listHandler);
router.get('/:id', hasPermission('clinicalNotes.read'), validateId, getHandler);
router.get('/:id/versiones', hasPermission('clinicalNotes.read'), validateId, getVersionHistoryHandler);
router.get('/:id/version-actual', hasPermission('clinicalNotes.read'), validateId, getLatestVersionHandler);
router.get('/:id/comparar', hasPermission('clinicalNotes.read'), validateCompareVersions, compareVersionsHandler);
router.get('/version/:versionId', hasPermission('clinicalNotes.read'), validateVersionId, getVersionHandler);

// Crear notas clínicas - Profesionales y administradores
router.post('/', hasPermission('clinicalNotes.create'), validateCreate, createHandler);

// Actualizar notas clínicas - Profesionales y administradores
router.patch('/:id', hasPermission('clinicalNotes.update'), validateUpdate, updateHandler);

module.exports = router;
