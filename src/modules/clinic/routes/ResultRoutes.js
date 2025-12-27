const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasPermission, hasAnyRole } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  getByOrderHandler,
  createHandler,
  updateHandler,
  deleteHandler,
  getVersionHistoryHandler,
  getVersionHandler,
  getLatestVersionHandler,
  compareVersionsHandler,
} = require('../controllers/ResultController');

const {
  validateCreate,
  validateUpdate,
  validateId,
  validateOrderId,
  validateList,
  validateVersionId,
  validateCompareVersions,
} = require('../validators/ResultValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Solo profesionales, administradores y auditores pueden acceder a resultados
router.use(hasAnyRole(['profesional', 'administrador', 'auditor']));

// Rutas sin parámetros dinámicos primero
router.get('/', hasPermission('results.read'), validateList, listHandler);
router.post('/', hasPermission('results.create'), validateCreate, createHandler);

// Rutas con paths específicos ANTES de rutas con :id genérico
router.get('/orden/:ordenId', hasPermission('results.read'), validateOrderId, getByOrderHandler);
router.get('/version/:versionId', hasPermission('results.read'), validateVersionId, getVersionHandler);

// Rutas con :id pero con sufijos específicos
router.get('/:id/versiones', hasPermission('results.read'), validateId, getVersionHistoryHandler);
router.get('/:id/version-actual', hasPermission('results.read'), validateId, getLatestVersionHandler);
router.get('/:id/comparar', hasPermission('results.read'), validateCompareVersions, compareVersionsHandler);

// Rutas genéricas con :id al final (estas capturan todo)
router.get('/:id', hasPermission('results.read'), validateId, getHandler);
router.patch('/:id', hasPermission('results.update'), validateUpdate, updateHandler);
router.delete('/:id', hasPermission('results.delete'), validateId, deleteHandler);

module.exports = router;

