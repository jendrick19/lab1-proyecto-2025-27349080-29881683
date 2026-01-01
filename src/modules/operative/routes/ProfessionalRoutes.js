const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasPermission } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler,
} = require('../controllers/ProfessionalController');

const {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
} = require('../validators/ProfessionalValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar y obtener profesionales - Todos pueden leer
router.get('/', hasPermission('professionals.read'), validateList, listHandler);
router.get('/:id', hasPermission('professionals.read'), validateId, getHandler);

// Crear profesionales - Solo administradores
router.post('/', hasPermission('professionals.create'), validateCreate, createHandler);

// Actualizar profesionales - Solo administradores
router.patch('/:id', hasPermission('professionals.update'), validateUpdate, updateHandler);

// Eliminar profesionales - Solo administradores
router.delete('/:id', hasPermission('professionals.delete'), validateId, deleteHandler);

module.exports = router;
