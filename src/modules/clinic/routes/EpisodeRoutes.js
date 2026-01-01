const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasPermission, hasAnyRole } = require('../../../shared/middlewares/authorizationMiddleware');

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

// Todas las rutas requieren autenticación
router.use(authenticate);

// Solo profesionales, administradores y auditores pueden acceder a episodios
router.use(hasAnyRole(['profesional', 'administrador', 'auditor']));

// Listar y obtener episodios - Con permiso de lectura
router.get('/', hasPermission('episodes.read'), validateList, listHandler);
router.get('/:id', hasPermission('episodes.read'), validateId, getHandler);

// Crear episodios - Profesionales y administradores
router.post('/', hasPermission('episodes.create'), validateCreate, createHandler);

// Actualizar episodios - Profesionales y administradores
router.patch('/:id', hasPermission('episodes.update'), validateUpdate, updateHandler);
router.patch('/:id/cerrar', hasPermission('episodes.update'), validateId, closeHandler);

// Sub-rutas de diagnósticos (heredan los middlewares)
router.use('/', episodeDiagnosisRouter);

module.exports = router;
