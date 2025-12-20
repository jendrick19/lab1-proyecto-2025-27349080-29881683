const { body, param, query } = require('express-validator');
const {
  handleValidationErrors,
  validateIdParam,
  validatePagination,
  validateSorting,
  validateStatus,
} = require('../../../shared/validators/CommonValidator');

const db = require('../../../../database/models');
const { PeopleAttended } = db.modules.operative;
const { Plan } = db.modules.bussines;

const checkPeopleExists = async (value) => {
  const person = await PeopleAttended.findByPk(value);
  if (!person) {
    throw new Error('El paciente especificado no existe');
  }
  if (!person.status) {
    throw new Error('El paciente especificado está inactivo');
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

const checkPolicyNumberUniqueness = async (value, { req }) => {
  const { Op } = require('sequelize');
  const Affiliation = db.modules.bussines.Affiliation;
  const where = {
    policyNumber: value,
  };
  if (req.params?.id) {
    where.id = { [Op.ne]: req.params.id };
  }
  const existingAffiliation = await Affiliation.findOne({ where });
  if (existingAffiliation) {
    throw new Error('El número de póliza ya está registrado');
  }
  return true;
};

const validateDateRange = (value, { req }) => {
  const startTime = req.body.vigenteDesde;
  const endTime = req.body.vigenteHasta;
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
  body('personaId')
    .notEmpty().withMessage('El ID de la persona es requerido')
    .isInt({ min: 1 }).withMessage('El ID de la persona debe ser un número entero positivo')
    .custom(checkPeopleExists),
  body('planId')
    .notEmpty().withMessage('El ID del plan es requerido')
    .isInt({ min: 1 }).withMessage('El ID del plan debe ser un número entero positivo')
    .custom(checkPlanExists),
  body('numeroPoliza')
    .notEmpty().withMessage('El número de póliza es requerido')
    .isLength({ min: 1, max: 100 }).withMessage('El número de póliza debe tener entre 1 y 100 caracteres')
    .trim()
    .custom(checkPolicyNumberUniqueness),
  body('vigenteDesde')
    .notEmpty().withMessage('La fecha de inicio de vigencia es requerida')
    .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida (formato ISO 8601)')
    .toDate(),
  body('vigenteHasta')
    .optional()
    .isISO8601().withMessage('La fecha de fin debe ser una fecha válida (formato ISO 8601)')
    .toDate()
    .custom(validateDateRange),
  body('copago')
    .optional()
    .isFloat({ min: 0 }).withMessage('El copago debe ser un número positivo'),
  body('cuotaModeradora')
    .optional()
    .isFloat({ min: 0 }).withMessage('La cuota moderadora debe ser un número positivo'),
  handleValidationErrors,
];

const validateUpdate = [
  validateIdParam(),
  body('personaId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de la persona debe ser un número entero positivo')
    .custom(checkPeopleExists),
  body('planId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del plan debe ser un número entero positivo')
    .custom(checkPlanExists),
  body('numeroPoliza')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('El número de póliza debe tener entre 1 y 100 caracteres')
    .trim()
    .custom(checkPolicyNumberUniqueness),
  body('vigenteDesde')
    .optional()
    .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida (formato ISO 8601)')
    .toDate(),
  body('vigenteHasta')
    .optional()
    .isISO8601().withMessage('La fecha de fin debe ser una fecha válida (formato ISO 8601)')
    .toDate()
    .custom(validateDateRange),
  body('copago')
    .optional()
    .isFloat({ min: 0 }).withMessage('El copago debe ser un número positivo'),
  body('cuotaModeradora')
    .optional()
    .isFloat({ min: 0 }).withMessage('La cuota moderadora debe ser un número positivo'),
  validateStatus('estado'),
  handleValidationErrors,
];

const validateId = [
  validateIdParam(),
  handleValidationErrors,
];

const validateList = [
  ...validatePagination(),
  ...validateSorting(['numeroPoliza', 'vigenteDesde', 'vigenteHasta', 'createdAt', 'estado']),
  query('personaId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de la persona debe ser un número entero positivo'),
  query('planId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del plan debe ser un número entero positivo'),
  query('numeroPoliza')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('El número de póliza debe tener entre 1 y 100 caracteres'),
  query('vigenteDesde')
    .optional()
    .isISO8601().withMessage('La fecha desde debe ser una fecha válida (formato ISO 8601)'),
  query('vigenteHasta')
    .optional()
    .isISO8601().withMessage('La fecha hasta debe ser una fecha válida (formato ISO 8601)'),
  query('estado')
    .optional()
    .isIn(['true', 'false', '1', '0', 'activo', 'inactive', 'active']).withMessage('Estado inválido'),
  handleValidationErrors,
];

module.exports = {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
};

