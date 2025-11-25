const { body, param, query } = require('express-validator');
const {
    handleValidationErrors,
    validateIdParam,
    validatePagination,
} = require('../../../shared/validators/CommonValidator');

const ALLOWED_STATUSES = ['abierta', 'cerrada', 'reservada'];

const checkProfessionalExists = async (value) => {
    const db = require('../../../../database/models');
    const { Professional } = db.modules.operative;

    const professional = await Professional.findByPk(value);

    if (!professional) {
        throw new Error('El profesional especificado no existe');
    }

    return true;
};

const checkCareUnitExists = async (value) => {
    const db = require('../../../../database/models');
    const { CareUnit } = db.modules.operative;

    const careUnit = await CareUnit.findByPk(value);

    if (!careUnit) {
        throw new Error('La unidad de atención especificada no existe');
    }

    return true;
};

const validateDateRange = (value, { req }) => {
    const startTime = req.body.fechaInicio;
    const endTime = req.body.fechaFin;

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
    body('profesionalId')
        .notEmpty().withMessage('El ID del profesional es requerido')
        .isInt({ min: 1 }).withMessage('El ID del profesional debe ser un número entero positivo')
        .custom(checkProfessionalExists),

    body('unidadId')
        .notEmpty().withMessage('El ID de la unidad es requerido')
        .isInt({ min: 1 }).withMessage('El ID de la unidad debe ser un número entero positivo')
        .custom(checkCareUnitExists),

    body('fechaInicio')
        .notEmpty().withMessage('La fecha de inicio es requerida')
        .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida (formato ISO 8601)')
        .toDate(),

    body('fechaFin')
        .notEmpty().withMessage('La fecha de fin es requerida')
        .isISO8601().withMessage('La fecha de fin debe ser una fecha válida (formato ISO 8601)')
        .toDate()
        .custom(validateDateRange),

    body('capacidad')
        .optional()
        .isInt({ min: 1 }).withMessage('La capacidad debe ser un número entero mayor o igual a 1'),

    body('estado')
        .optional()
        .isIn(ALLOWED_STATUSES).withMessage(`El estado debe ser uno de los siguientes: ${ALLOWED_STATUSES.join(', ')}`),

    handleValidationErrors,
];

const validateUpdate = [
    validateIdParam(),

    body('profesionalId')
        .optional()
        .isInt({ min: 1 }).withMessage('El ID del profesional debe ser un número entero positivo')
        .custom(checkProfessionalExists),

    body('unidadId')
        .optional()
        .isInt({ min: 1 }).withMessage('El ID de la unidad debe ser un número entero positivo')
        .custom(checkCareUnitExists),

    body('fechaInicio')
        .optional()
        .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida (formato ISO 8601)')
        .toDate(),

    body('fechaFin')
        .optional()
        .isISO8601().withMessage('La fecha de fin debe ser una fecha válida (formato ISO 8601)')
        .toDate()
        .custom(validateDateRange),

    body('capacidad')
        .optional()
        .isInt({ min: 1 }).withMessage('La capacidad debe ser un número entero mayor o igual a 1'),

    body('estado')
        .optional()
        .isIn(ALLOWED_STATUSES).withMessage(`El estado debe ser uno de los siguientes: ${ALLOWED_STATUSES.join(', ')}`),

    handleValidationErrors,
];

const validateId = [
    validateIdParam(),
    handleValidationErrors,
];

const validateList = [
    ...validatePagination(),
    handleValidationErrors,
];

const validateProfessionalId = [
    param('professionalId')
        .notEmpty().withMessage('El ID del profesional es requerido')
        .isInt({ min: 1 }).withMessage('El ID del profesional debe ser un número entero positivo'),
    handleValidationErrors,
];

const validateUnitId = [
    param('unitId')
        .notEmpty().withMessage('El ID de la unidad es requerido')
        .isInt({ min: 1 }).withMessage('El ID de la unidad debe ser un número entero positivo'),
    handleValidationErrors,
];

const validateSearchByName = [
    query('nombre')
        .optional()
        .isLength({ min: 1, max: 100 }).withMessage('El nombre debe tener entre 1 y 100 caracteres')
        .trim(),
    
    query('id')
        .optional()
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    
    query().custom((value, { req }) => {
        if (!req.query.nombre && !req.query.id) {
            throw new Error('Debe proporcionar al menos "nombre" o "id" para la búsqueda');
        }
        return true;
    }),
    
    handleValidationErrors,
];

module.exports = {
    validateCreate,
    validateUpdate,
    validateId,
    validateList,
    validateProfessionalId,
    validateUnitId,
    validateSearchByName,
};

