const { body, param, query } = require('express-validator');
const {
  handleValidationErrors,
  validateIdParam,
  validatePagination,
  validateSorting,
} = require('../../../shared/validators/CommonValidator');

const db = require('../../../../database/models');
const { Order } = db.modules.clinic;
const { Plan, Authorization } = db.modules.bussines;

const VALID_STATUSES = ['solicitada', 'aprobada', 'negada'];

const checkOrderExists = async (value) => {
  const order = await Order.findByPk(value);
  if (!order) {
    throw new Error('La orden especificada no existe');
  }
  return true;
};

const checkPlanExists = async (value) => {
  const plan = await Plan.findByPk(value);
  if (!plan) {
    throw new Error('El plan especificado no existe');
  }
  if (!plan.activo) {
    throw new Error('El plan especificado está inactivo');
  }
  return true;
};

const checkAuthorizationNumberUniqueness = async (value, { req }) => {
  const { Op } = require('sequelize');
  const where = {
    authorizationNumber: value,
  };
  if (req.params?.id) {
    where.id = { [Op.ne]: req.params.id };
  }
  const existingAuthorization = await Authorization.findOne({ where });
  if (existingAuthorization) {
    throw new Error('El número de autorización ya está registrado');
  }
  return true;
};

const validateDateRange = (value, { req }) => {
  const startTime = req.body.fechaSolicitud;
  const endTime = req.body.fechaRespuesta;
  if (startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      throw new Error('La fecha de solicitud debe ser anterior a la fecha de respuesta');
    }
  }
  return true;
};

const validateCreate = [
  body('ordenId')
    .notEmpty().withMessage('El ID de la orden es requerido')
    .isInt({ min: 1 }).withMessage('El ID de la orden debe ser un número entero positivo')
    .custom(checkOrderExists),
  body('planId')
    .notEmpty().withMessage('El ID del plan es requerido')
    .isInt({ min: 1 }).withMessage('El ID del plan debe ser un número entero positivo')
    .custom(checkPlanExists),
  body('procedimientoCodigo')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('El código del procedimiento debe tener entre 1 y 100 caracteres')
    .trim(),
  body('estado')
    .optional()
    .customSanitizer((value) => value ? value.toLowerCase() : value)
    .isIn(VALID_STATUSES).withMessage(`El estado debe ser uno de los siguientes: ${VALID_STATUSES.join(', ')}`),
  body('fechaSolicitud')
    .optional()
    .isISO8601().withMessage('La fecha de solicitud debe ser una fecha válida (formato ISO 8601)')
    .toDate(),
  body('fechaRespuesta')
    .optional()
    .isISO8601().withMessage('La fecha de respuesta debe ser una fecha válida (formato ISO 8601)')
    .toDate()
    .custom(validateDateRange),
  body('numeroAutorizacion')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('El número de autorización debe tener entre 1 y 100 caracteres')
    .trim()
    .custom(checkAuthorizationNumberUniqueness),
  body('observaciones')
    .optional()
    .isLength({ max: 1000 }).withMessage('Las observaciones no pueden superar los 1000 caracteres')
    .trim(),
  handleValidationErrors,
];

const validateUpdate = [
  validateIdParam(),
  body('ordenId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de la orden debe ser un número entero positivo')
    .custom(checkOrderExists),
  body('planId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del plan debe ser un número entero positivo')
    .custom(checkPlanExists),
  body('procedimientoCodigo')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('El código del procedimiento debe tener entre 1 y 100 caracteres')
    .trim(),
  body('estado')
    .optional()
    .customSanitizer((value) => value ? value.toLowerCase() : value)
    .isIn(VALID_STATUSES).withMessage(`El estado debe ser uno de los siguientes: ${VALID_STATUSES.join(', ')}`),
  body('fechaSolicitud')
    .optional()
    .isISO8601().withMessage('La fecha de solicitud debe ser una fecha válida (formato ISO 8601)')
    .toDate(),
  body('fechaRespuesta')
    .optional()
    .isISO8601().withMessage('La fecha de respuesta debe ser una fecha válida (formato ISO 8601)')
    .toDate()
    .custom(validateDateRange),
  body('numeroAutorizacion')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('El número de autorización debe tener entre 1 y 100 caracteres')
    .trim()
    .custom(checkAuthorizationNumberUniqueness),
  body('observaciones')
    .optional()
    .isLength({ max: 1000 }).withMessage('Las observaciones no pueden superar los 1000 caracteres')
    .trim(),
  handleValidationErrors,
];

const validateId = [
  validateIdParam(),
  handleValidationErrors,
];

const validateList = [
  ...validatePagination(),
  ...validateSorting(['numeroAutorizacion', 'fechaSolicitud', 'fechaRespuesta', 'estado', 'createdAt']),
  query('ordenId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de la orden debe ser un número entero positivo'),
  query('planId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del plan debe ser un número entero positivo'),
  query('procedimientoCodigo')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('El código del procedimiento debe tener entre 1 y 100 caracteres'),
  query('estado')
    .optional()
    .customSanitizer((value) => value ? value.toLowerCase() : value)
    .isIn(VALID_STATUSES).withMessage(`El estado debe ser uno de los siguientes: ${VALID_STATUSES.join(', ')}`),
  query('fechaSolicitud')
    .optional()
    .isISO8601().withMessage('La fecha desde debe ser una fecha válida (formato ISO 8601)'),
  query('fechaRespuesta')
    .optional()
    .isISO8601().withMessage('La fecha hasta debe ser una fecha válida (formato ISO 8601)'),
  query('numeroAutorizacion')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('El número de autorización debe tener entre 1 y 100 caracteres'),
  handleValidationErrors,
];

module.exports = {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
};

