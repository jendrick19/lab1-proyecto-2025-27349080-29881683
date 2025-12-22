const { body, param, query } = require('express-validator');
const {
  handleValidationErrors,
  validateIdParam,
  validatePagination,
  validateSorting,
} = require('../../../shared/validators/CommonValidator');

const db = require('../../../../database/models');
const { Service } = db.modules.bussines;
const { Plan } = db.modules.bussines;

const checkServiceExists = async (value) => {
  const service = await Service.findByPk(value);
  if (!service) {
    throw new Error('La prestación especificada no existe');
  }
  return true;
};

const checkPlanExists = async (value) => {
  // Permitir null para tarifa general
  if (value === null || value === 'null' || value === 'general') {
    return true;
  }
  const plan = await Plan.findByPk(value);
  if (!plan) {
    throw new Error('El plan especificado no existe');
  }
  if (!plan.activo) {
    throw new Error('El plan especificado está inactivo');
  }
  return true;
};

const validateDateRange = (value, { req }) => {
  const startTime = req.body.vigenciaDesde;
  const endTime = req.body.vigenciaHasta;
  if (startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }
  }
  return true;
};

const validateCreate = [
  body('prestacionCodigo')
    .notEmpty().withMessage('El código de la prestación es requerido')
    .isLength({ min: 1, max: 50 }).withMessage('El código de la prestación debe tener entre 1 y 50 caracteres')
    .trim()
    .custom(checkServiceExists),
  body('planId')
    .optional()
    .custom(async (value) => {
      if (value === null || value === 'null' || value === 'general') {
        return true; // Tarifa general permitida
      }
      if (typeof value === 'string' && value.trim() === '') {
        return true; // Vacío se interpreta como null
      }
      return checkPlanExists(value);
    }),
  body('valorBase')
    .notEmpty().withMessage('El valor base es requerido')
    .isFloat({ min: 0 }).withMessage('El valor base debe ser un número positivo'),
  body('impuestos')
    .optional()
    .isFloat({ min: 0 }).withMessage('Los impuestos deben ser un número positivo'),
  body('vigenciaDesde')
    .notEmpty().withMessage('La fecha de inicio de vigencia es requerida')
    .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida (formato ISO 8601)')
    .toDate(),
  body('vigenciaHasta')
    .optional()
    .isISO8601().withMessage('La fecha de fin debe ser una fecha válida (formato ISO 8601)')
    .toDate()
    .custom(validateDateRange),
  handleValidationErrors,
];

const validateUpdate = [
  validateIdParam(),
  body('prestacionCodigo')
    .optional()
    .isLength({ min: 1, max: 50 }).withMessage('El código de la prestación debe tener entre 1 y 50 caracteres')
    .trim()
    .custom(checkServiceExists),
  body('planId')
    .optional()
    .custom(async (value) => {
      if (value === null || value === 'null' || value === 'general') {
        return true; // Tarifa general permitida
      }
      if (typeof value === 'string' && value.trim() === '') {
        return true; // Vacío se interpreta como null
      }
      return checkPlanExists(value);
    }),
  body('valorBase')
    .optional()
    .isFloat({ min: 0 }).withMessage('El valor base debe ser un número positivo'),
  body('impuestos')
    .optional()
    .isFloat({ min: 0 }).withMessage('Los impuestos deben ser un número positivo'),
  body('vigenciaDesde')
    .optional()
    .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida (formato ISO 8601)')
    .toDate(),
  body('vigenciaHasta')
    .optional()
    .isISO8601().withMessage('La fecha de fin debe ser una fecha válida (formato ISO 8601)')
    .toDate()
    .custom(validateDateRange),
  handleValidationErrors,
];

const validateId = [
  validateIdParam(),
  handleValidationErrors,
];

const validateList = [
  ...validatePagination(),
  ...validateSorting(['valorBase', 'vigenciaDesde', 'vigenciaHasta', 'createdAt']),
  query('prestacionCodigo')
    .optional()
    .isLength({ min: 1, max: 50 }).withMessage('El código de la prestación debe tener entre 1 y 50 caracteres'),
  query('planId')
    .optional()
    .custom(async (value) => {
      if (value === null || value === 'null' || value === 'general') {
        return true; // Tarifa general permitida
      }
      if (typeof value === 'string' && value.trim() === '') {
        return true;
      }
      if (!isNaN(Number(value))) {
        return true;
      }
      throw new Error('El planId debe ser un número, null, o "general"');
    }),
  query('vigenciaDesde')
    .optional()
    .isISO8601().withMessage('La fecha desde debe ser una fecha válida (formato ISO 8601)'),
  query('vigenciaHasta')
    .optional()
    .isISO8601().withMessage('La fecha hasta debe ser una fecha válida (formato ISO 8601)'),
  handleValidationErrors,
];

const validateActiveTariff = [
  param('prestacionCodigo')
    .notEmpty().withMessage('El código de la prestación es requerido')
    .isLength({ min: 1, max: 50 }).withMessage('El código de la prestación debe tener entre 1 y 50 caracteres')
    .trim(),
  query('planId')
    .optional()
    .custom(async (value) => {
      if (value === null || value === 'null' || value === 'general' || value === undefined) {
        return true; // Tarifa general permitida
      }
      if (!isNaN(Number(value))) {
        return true;
      }
      throw new Error('El planId debe ser un número, null, o "general"');
    }),
  handleValidationErrors,
];

module.exports = {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
  validateActiveTariff,
};

