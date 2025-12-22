const { body, param, query } = require('express-validator');
const {
  handleValidationErrors,
  validatePagination,
  validateSorting,
} = require('../../../shared/validators/CommonValidator');

const db = require('../../../../database/models');
const { Service } = db.modules.bussines;

const checkCodeUniqueness = async (value, { req }) => {
  const existingService = await Service.findByPk(value);
  if (existingService) {
    throw new Error('Ya existe una prestación con este código');
  }
  return true;
};

const validateCreate = [
  body('codigo')
    .notEmpty().withMessage('El código es requerido')
    .isLength({ min: 1, max: 50 }).withMessage('El código debe tener entre 1 y 50 caracteres')
    .trim()
    .custom(checkCodeUniqueness),
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 1, max: 200 }).withMessage('El nombre debe tener entre 1 y 200 caracteres')
    .trim(),
  body('grupo')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('El grupo debe tener entre 1 y 100 caracteres')
    .trim(),
  body('requisitos')
    .optional()
    .isLength({ max: 500 }).withMessage('Los requisitos no pueden superar los 500 caracteres')
    .trim(),
  body('tiempoEstimado')
    .optional()
    .isLength({ max: 50 }).withMessage('El tiempo estimado no puede superar los 50 caracteres')
    .trim(),
  body('requiereAutorizacion')
    .optional()
    .isBoolean().withMessage('El campo requiere autorización debe ser un valor booleano (true/false)'),
  handleValidationErrors,
];

const validateUpdate = [
  param('codigo')
    .notEmpty().withMessage('El código es requerido')
    .isLength({ min: 1, max: 50 }).withMessage('El código debe tener entre 1 y 50 caracteres')
    .trim(),
  body('codigo')
    .not().exists().withMessage('No se puede cambiar el código de una prestación'),
  body('nombre')
    .optional()
    .isLength({ min: 1, max: 200 }).withMessage('El nombre debe tener entre 1 y 200 caracteres')
    .trim(),
  body('grupo')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('El grupo debe tener entre 1 y 100 caracteres')
    .trim(),
  body('requisitos')
    .optional()
    .isLength({ max: 500 }).withMessage('Los requisitos no pueden superar los 500 caracteres')
    .trim(),
  body('tiempoEstimado')
    .optional()
    .isLength({ max: 50 }).withMessage('El tiempo estimado no puede superar los 50 caracteres')
    .trim(),
  body('requiereAutorizacion')
    .optional()
    .isBoolean().withMessage('El campo requiere autorización debe ser un valor booleano (true/false)'),
  handleValidationErrors,
];

const validateCode = [
  param('codigo')
    .notEmpty().withMessage('El código es requerido')
    .isLength({ min: 1, max: 50 }).withMessage('El código debe tener entre 1 y 50 caracteres')
    .trim(),
  handleValidationErrors,
];

const validateList = [
  ...validatePagination(),
  ...validateSorting(['codigo', 'nombre', 'grupo', 'createdAt']),
  query('codigo')
    .optional()
    .isLength({ min: 1, max: 50 }).withMessage('El código debe tener entre 1 y 50 caracteres'),
  query('nombre')
    .optional()
    .isLength({ min: 1, max: 200 }).withMessage('El nombre debe tener entre 1 y 200 caracteres'),
  query('grupo')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('El grupo debe tener entre 1 y 100 caracteres'),
  query('requiereAutorizacion')
    .optional()
    .isBoolean().withMessage('El campo requiere autorización debe ser un valor booleano (true/false)'),
  handleValidationErrors,
];

module.exports = {
  validateCreate,
  validateUpdate,
  validateCode,
  validateList,
};

