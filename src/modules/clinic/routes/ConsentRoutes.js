const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasPermission, hasAnyRole } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler,
} = require('../controllers/ConsentController');
const {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
} = require('../validators/ConsentValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Solo profesionales, administradores y auditores pueden acceder a consentimientos
router.use(hasAnyRole(['profesional', 'administrador', 'auditor']));

// Listar y obtener consentimientos - Con permiso de lectura
router.get('/', hasPermission('consents.read'), validateList, listHandler);
router.get('/:id', hasPermission('consents.read'), validateId, getHandler);

// Crear consentimientos - Profesionales y administradores
router.post('/', hasPermission('consents.create'), validateCreate, createHandler);

// Actualizar consentimientos - Profesionales y administradores
router.put('/:id', hasPermission('consents.update'), validateUpdate, updateHandler);

// Eliminar consentimientos - Profesionales y administradores
router.delete('/:id', hasPermission('consents.delete'), validateId, deleteHandler);

module.exports = router;
