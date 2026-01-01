const { Router } = require('express');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');
const { hasPermission, hasAnyRole } = require('../../../shared/middlewares/authorizationMiddleware');

const {
  listOrdersHandler,
  getOrderHandler,
  createOrderHandler,
  updateOrderHandler,
  deleteOrderHandler,
  listOrderItemsHandler,
  createOrderItemHandler,
  updateOrderItemHandler,
  deleteOrderItemHandler,
} = require('../controllers/OrderController');
const {
  validateCreateOrder,
  validateUpdateOrder,
  validateOrderId,
  validateListOrders,
  validateCreateOrderItem,
  validateUpdateOrderItem,
  validateListOrderItems,
  validateOrderItemId,
} = require('../validators/OrderValidator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Solo profesionales, administradores y auditores pueden acceder a órdenes
router.use(hasAnyRole(['profesional', 'administrador', 'auditor']));

// ==================== ORDER ROUTES ====================
// Listar y obtener órdenes - Con permiso de lectura
router.get('/', hasPermission('orders.read'), validateListOrders, listOrdersHandler);
router.get('/:id', hasPermission('orders.read'), validateOrderId, getOrderHandler);
router.get('/:id/items', hasPermission('orders.read'), validateListOrderItems, listOrderItemsHandler);

// Crear órdenes - Profesionales y administradores
router.post('/', hasPermission('orders.create'), validateCreateOrder, createOrderHandler);
router.post('/:id/items', hasPermission('orders.create'), validateCreateOrderItem, createOrderItemHandler);

// Actualizar órdenes - Profesionales y administradores
router.patch('/:id', hasPermission('orders.update'), validateUpdateOrder, updateOrderHandler);
router.patch('/:id/items/:itemId', hasPermission('orders.update'), validateUpdateOrderItem, updateOrderItemHandler);

// Eliminar órdenes - Profesionales y administradores
router.delete('/:id', hasPermission('orders.delete'), validateOrderId, deleteOrderHandler);
router.delete('/:id/items/:itemId', hasPermission('orders.delete'), validateOrderItemId, deleteOrderItemHandler);

module.exports = router;

