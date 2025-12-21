const { body, param, query } = require('express-validator');
const {
  handleValidationErrors,
  validateIdParam,
  validatePagination,
  validateSorting,
} = require('../../../shared/validators/CommonValidator');

const db = require('../../../../database/models');
const { Service } = db.modules.bussines;

const checkServiceExists = async (value) => {
  const service = await Service.findByPk(value);
  if (!service) {
    throw new Error('La prestación especificada no existe');
  }
  return true;
};

const validateCreate = [
  param('invoiceId')
    .isInt({ min: 1 }).withMessage('El ID de factura debe ser un número entero válido'),
  body('prestacionCodigo')
    .notEmpty().withMessage('El código de la prestación es requerido')
    .isLength({ min: 1, max: 50 }).withMessage('El código de la prestación debe tener entre 1 y 50 caracteres')
    .trim()
    .custom(checkServiceExists),
  body('descripcion')
    .optional()
    .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres')
    .trim(),
  body('cantidad')
    .notEmpty().withMessage('La cantidad es requerida')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero mayor a 0'),
  body('valorUnitario')
    .notEmpty().withMessage('El valor unitario es requerido')
    .isFloat({ min: 0.01 }).withMessage('El valor unitario debe ser un número positivo mayor a 0'),
  body('impuestos')
    .optional()
    .isFloat({ min: 0 }).withMessage('Los impuestos deben ser un número positivo'),
  handleValidationErrors,
];

const validateUpdate = [
  validateIdParam(),
  body('prestacionCodigo')
    .optional()
    .isLength({ min: 1, max: 50 }).withMessage('El código de la prestación debe tener entre 1 y 50 caracteres')
    .trim()
    .custom(checkServiceExists),
  body('descripcion')
    .optional()
    .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres')
    .trim(),
  body('cantidad')
    .optional()
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero mayor a 0'),
  body('valorUnitario')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('El valor unitario debe ser un número positivo mayor a 0'),
  body('impuestos')
    .optional()
    .isFloat({ min: 0 }).withMessage('Los impuestos deben ser un número positivo'),
  handleValidationErrors,
];

const validateId = [
  validateIdParam(),
  handleValidationErrors,
];

const validateList = [
  ...validatePagination(),
  ...validateSorting(['cantidad', 'valorUnitario', 'total', 'createdAt']),
  query('facturaId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de factura debe ser un número entero válido'),
  query('prestacionCodigo')
    .optional()
    .isLength({ min: 1, max: 50 }).withMessage('El código de prestación debe tener entre 1 y 50 caracteres'),
  handleValidationErrors,
];

module.exports = {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
};

