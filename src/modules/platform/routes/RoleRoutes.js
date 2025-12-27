const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { isAdmin } = require('../../../shared/middlewares/authorizationMiddleware');
const {
  listRolesHandler,
  getRoleHandler,
  listPermissionsHandler,
  assignPermissionsHandler,
  removePermissionsHandler
} = require('../controllers/RoleController');

const router = Router();

// Todas las rutas de roles requieren autenticación
router.use(authenticate);

// Listar roles - Solo administradores
router.get('/', isAdmin, listRolesHandler);

// Obtener rol específico - Solo administradores
router.get('/:id', isAdmin, getRoleHandler);

// Listar permisos disponibles - Solo administradores
router.get('/permissions/all', isAdmin, listPermissionsHandler);

// Asignar permisos a rol - Solo administradores
router.post('/:id/permissions', isAdmin, assignPermissionsHandler);

// Remover permisos de rol - Solo administradores
router.delete('/:id/permissions', isAdmin, removePermissionsHandler);

module.exports = router;

