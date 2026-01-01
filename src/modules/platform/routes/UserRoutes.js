const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { isAdmin } = require('../../../shared/middlewares/authorizationMiddleware');
const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler,
  assignRolesHandler,
  removeRolesHandler
} = require('../controllers/UserController');

const router = Router();

// Todas las rutas de usuarios requieren autenticación
router.use(authenticate);

// Listar usuarios - Solo administradores
router.get('/', isAdmin, listHandler);

// Obtener usuario específico - Solo administradores
router.get('/:id', isAdmin, getHandler);

// Crear usuario - Solo administradores
router.post('/', isAdmin, createHandler);

// Actualizar usuario - Solo administradores
router.put('/:id', isAdmin, updateHandler);

// Eliminar usuario - Solo administradores
router.delete('/:id', isAdmin, deleteHandler);

// Asignar roles a usuario - Solo administradores
router.post('/:id/roles', isAdmin, assignRolesHandler);

// Remover roles de usuario - Solo administradores
router.delete('/:id/roles', isAdmin, removeRolesHandler);

module.exports = router;

