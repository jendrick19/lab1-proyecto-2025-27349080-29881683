const { body, param, query } = require('express-validator');
const {
  handleValidationErrors,
  validateIdParam,
  validatePagination,
  validateSorting,
} = require('../../../shared/validators/CommonValidator');

const db = require('../../../../database/models');
const { Invoice } = db.modules.bussines;

const checkInvoiceExists = async (value) => {
  const invoice = await Invoice.findByPk(value);
  if (!invoice) {
    throw new Error('La factura especificada no existe');
  }
  return true;
};

const validateCreate = [
  body('facturaId')
    .notEmpty().withMessage('La factura es requerida')
    .isInt({ min: 1 }).withMessage('El ID de factura debe ser un número entero válido')
    .custom(checkInvoiceExists),
  body('monto')
    .notEmpty().withMessage('El monto es requerido')
    .isFloat({ min: 0.01 }).withMessage('El monto debe ser un número positivo mayor a 0'),
  body('medio')
    .notEmpty().withMessage('El medio de pago es requerido')
    .isIn(['efectivo', 'tarjeta', 'transferencia']).withMessage('El medio debe ser efectivo, tarjeta o transferencia'),
  body('referencia')
    .optional()
    .isLength({ max: 200 }).withMessage('La referencia no puede exceder 200 caracteres')
    .trim(),
  body('estado')
    .optional()
    .isIn(['pendiente', 'completado', 'cancelado', 'rechazado']).withMessage('Estado inválido'),
  body('fecha')
    .optional()
    .isISO8601().withMessage('La fecha debe ser una fecha válida (formato ISO 8601)')
    .toDate(),
  handleValidationErrors,
];

const validateUpdate = [
  validateIdParam(),
  body('facturaId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de factura debe ser un número entero válido')
    .custom(checkInvoiceExists),
  body('monto')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('El monto debe ser un número positivo mayor a 0'),
  body('medio')
    .optional()
    .isIn(['efectivo', 'tarjeta', 'transferencia']).withMessage('El medio debe ser efectivo, tarjeta o transferencia'),
  body('referencia')
    .optional()
    .isLength({ max: 200 }).withMessage('La referencia no puede exceder 200 caracteres')
    .trim(),
  body('estado')
    .optional()
    .isIn(['pendiente', 'completado', 'cancelado', 'rechazado']).withMessage('Estado inválido'),
  body('fecha')
    .optional()
    .isISO8601().withMessage('La fecha debe ser una fecha válida (formato ISO 8601)')
    .toDate(),
  handleValidationErrors,
];

const validateId = [
  validateIdParam(),
  handleValidationErrors,
];

const validateInvoiceId = [
  param('invoiceId')
    .notEmpty().withMessage('El ID de factura es requerido')
    .isInt({ min: 1 }).withMessage('El ID de factura debe ser un número entero válido'),
  handleValidationErrors,
];

const validateList = [
  ...validatePagination(),
  ...validateSorting(['fecha', 'monto', 'estado', 'createdAt']),
  query('facturaId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de factura debe ser un número entero válido'),
  query('estado')
    .optional()
    .isIn(['pendiente', 'completado', 'cancelado', 'rechazado']).withMessage('Estado inválido'),
  query('medio')
    .optional()
    .isIn(['efectivo', 'tarjeta', 'transferencia']).withMessage('El medio debe ser efectivo, tarjeta o transferencia'),
  query('fechaDesde')
    .optional()
    .isISO8601().withMessage('La fecha desde debe ser una fecha válida (formato ISO 8601)'),
  query('fechaHasta')
    .optional()
    .isISO8601().withMessage('La fecha hasta debe ser una fecha válida (formato ISO 8601)'),
  handleValidationErrors,
];

module.exports = {
  validateCreate,
  validateUpdate,
  validateId,
  validateInvoiceId,
  validateList,
};

