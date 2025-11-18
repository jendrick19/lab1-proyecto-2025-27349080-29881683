const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para manejar los errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    
    // Detectar si hay errores de duplicados (409 - Conflict)
    const hasDuplicateError = errorArray.some(err => 
      err.msg.includes('ya está registrado') || 
      err.msg.includes('ya existe')
    );

    if (hasDuplicateError) {
      return res.status(409).json({
        codigo: 409,
        mensaje: 'Conflicto: recurso duplicado',
        tipo: 'ConflictError',
        errores: errorArray.map(err => ({
          campo: err.path,
          mensaje: err.msg,
          valor: err.value,
        })),
      });
    }

    // Errores de validación normales (400 - Bad Request)
    return res.status(400).json({
      codigo: 400,
      mensaje: 'Errores de validación',
      tipo: 'ValidationError',
      errores: errorArray.map(err => ({
        campo: err.path,
        mensaje: err.msg,
        valor: err.value,
      })),
    });
  }
  return next();
};

/**
 * Validaciones comunes reutilizables
 */

// Validación de nombres
const validateNames = () => 
  body('nombres')
    .notEmpty().withMessage('Los nombres son requeridos')
    .isLength({ min: 2, max: 100 }).withMessage('Los nombres deben tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/).withMessage('Los nombres solo pueden contener letras');

const validateNamesOptional = () => 
  body('nombres')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Los nombres deben tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/).withMessage('Los nombres solo pueden contener letras');

// Validación de apellidos
const validateSurnames = () => 
  body('apellidos')
    .notEmpty().withMessage('Los apellidos son requeridos')
    .isLength({ min: 2, max: 100 }).withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/).withMessage('Los apellidos solo pueden contener letras');

const validateSurnamesOptional = () => 
  body('apellidos')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/).withMessage('Los apellidos solo pueden contener letras');

// Validación de email
const validateEmail = (fieldName = 'correo') => 
  body(fieldName)
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('El correo debe ser una dirección válida')
    .normalizeEmail();

const validateEmailOptional = (fieldName = 'correo') => 
  body(fieldName)
    .optional()
    .isEmail().withMessage('El correo debe ser una dirección válida')
    .normalizeEmail();

// Validación de teléfono
const validatePhone = (fieldName = 'telefono') => 
  body(fieldName)
    .optional()
    .matches(/^\+?[0-9]{7,15}$/).withMessage('El teléfono debe contener entre 7 y 15 dígitos');

// Validación de estado (boolean)
const validateStatus = (fieldName = 'estado') => 
  body(fieldName)
    .optional()
    .isBoolean().withMessage('El estado debe ser verdadero o falso');

// Validación de ID en params
const validateIdParam = () => 
  param('id')
    .notEmpty().withMessage('El ID es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo');

// Validaciones de paginación (query params)
const validatePagination = () => [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un número entero positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100'),
];

// Validaciones de ordenamiento (query params)
const validateSorting = (allowedFields) => [
  query('sortBy')
    .optional()
    .isIn(allowedFields).withMessage(`Campo de ordenamiento inválido. Campos permitidos: ${allowedFields.join(', ')}`),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('El orden debe ser "asc" o "desc"'),
];

// Validación de estado en query
const validateStatusQuery = () => 
  query('estado')
    .optional()
    .isIn(['true', 'false', '1', '0', 'activo', 'inactive', 'active']).withMessage('Estado inválido');

module.exports = {
  handleValidationErrors,
  validateNames,
  validateNamesOptional,
  validateSurnames,
  validateSurnamesOptional,
  validateEmail,
  validateEmailOptional,
  validatePhone,
  validateStatus,
  validateIdParam,
  validatePagination,
  validateSorting,
  validateStatusQuery,
};

