const { body, param, query } = require('express-validator');
const {
  handleValidationErrors,
  validateIdParam,
  validatePagination,
  validateSorting,
} = require('../../../shared/validators/CommonValidator');

const db = require('../../../../database/models');
const { PeopleAttended } = db.modules.operative;
const { Appointment } = db.modules.operative;

const VALID_TYPES = ['email', 'sms', 'push'];
const VALID_STATUSES = ['pendiente', 'enviado', 'error', 'reintentado'];
const VALID_TEMPLATES = [
  'cita_confirmacion',
  'cita_recordatorio',
  'resultado_disponible',
  'factura_emitida'
];

const checkPeopleExists = async (value) => {
  if (!value) return true; // Opcional

  const person = await PeopleAttended.findByPk(value);
  if (!person) {
    throw new Error('El paciente especificado no existe');
  }
  if (!person.status) {
    throw new Error('El paciente especificado está inactivo');
  }
  return true;
};

const checkAppointmentExists = async (value) => {
  if (!value) return true; // Opcional

  const appointment = await Appointment.findByPk(value);
  if (!appointment) {
    throw new Error('La cita especificada no existe');
  }
  return true;
};

const validateEmail = (value, { req }) => {
  if (req.body.tipo === 'email' || !req.body.tipo) {
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error('Debe proporcionar un email válido para notificaciones por correo');
    }
  }
  return true;
};

const validatePhone = (value, { req }) => {
  if (req.body.tipo === 'sms') {
    if (!value || !/^\+?[1-9]\d{1,14}$/.test(value)) {
      throw new Error('Debe proporcionar un número de teléfono válido para notificaciones SMS');
    }
  }
  return true;
};

const validateRelation = (value, { req }) => {
  const { pacienteId, citaId, resultadoId, facturaId } = req.body;
  
  if (!pacienteId && !citaId && !resultadoId && !facturaId) {
    throw new Error('Debe especificar al menos un paciente, cita, resultado o factura');
  }
  
  return true;
};

const validateCreate = [
  body('tipo')
    .optional()
    .isIn(VALID_TYPES).withMessage(`El tipo debe ser uno de: ${VALID_TYPES.join(', ')}`),
  
  body('destinatario')
    .notEmpty().withMessage('El destinatario es requerido')
    .isString().withMessage('El destinatario debe ser un string')
    .custom(validateEmail)
    .custom(validatePhone),
  
  body('plantilla')
    .notEmpty().withMessage('La plantilla es requerida')
    .isIn(VALID_TEMPLATES).withMessage(`La plantilla debe ser una de: ${VALID_TEMPLATES.join(', ')}`),
  
  body('asunto')
    .optional()
    .isString().withMessage('El asunto debe ser un string')
    .isLength({ max: 255 }).withMessage('El asunto no puede exceder 255 caracteres'),
  
  body('datos')
    .notEmpty().withMessage('Los datos de la notificación son requeridos')
    .isObject().withMessage('Los datos deben ser un objeto'),
  
  body('pacienteId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del paciente debe ser un número entero positivo')
    .custom(checkPeopleExists)
    .custom(validateRelation),
  
  body('citaId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de la cita debe ser un número entero positivo')
    .custom(checkAppointmentExists),
  
  body('resultadoId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del resultado debe ser un número entero positivo'),
  
  body('facturaId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de la factura debe ser un número entero positivo'),
  
  handleValidationErrors
];

const validateList = [
  ...validatePagination(),
  ...validateSorting(['fecha', 'estado', 'tipo'], 'fecha'),
  
  query('pacienteId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del paciente debe ser un número entero positivo'),
  
  query('citaId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de la cita debe ser un número entero positivo'),
  
  query('tipo')
    .optional()
    .isIn(VALID_TYPES).withMessage(`El tipo debe ser uno de: ${VALID_TYPES.join(', ')}`),
  
  query('estado')
    .optional()
    .isIn(VALID_STATUSES).withMessage(`El estado debe ser uno de: ${VALID_STATUSES.join(', ')}`),
  
  query('plantilla')
    .optional()
    .isIn(VALID_TEMPLATES).withMessage(`La plantilla debe ser una de: ${VALID_TEMPLATES.join(', ')}`),
  
  query('fechaDesde')
    .optional()
    .isISO8601().withMessage('fechaDesde debe ser una fecha válida (ISO 8601)'),
  
  query('fechaHasta')
    .optional()
    .isISO8601().withMessage('fechaHasta debe ser una fecha válida (ISO 8601)'),
  
  handleValidationErrors
];

const validateStatistics = [
  query('tipo')
    .optional()
    .isIn(VALID_TYPES).withMessage(`El tipo debe ser uno de: ${VALID_TYPES.join(', ')}`),
  
  query('fechaDesde')
    .optional()
    .isISO8601().withMessage('fechaDesde debe ser una fecha válida (ISO 8601)'),
  
  query('fechaHasta')
    .optional()
    .isISO8601().withMessage('fechaHasta debe ser una fecha válida (ISO 8601)'),
  
  handleValidationErrors
];

const validateId = [
  validateIdParam(),
  handleValidationErrors
];

module.exports = {
  validateCreate,
  validateList,
  validateStatistics,
  validateId,
  VALID_TYPES,
  VALID_STATUSES,
  VALID_TEMPLATES
};

