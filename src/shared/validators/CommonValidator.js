const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    
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

const validatePhone = (fieldName = 'telefono') => 
  body(fieldName)
    .optional()
    .matches(/^\+?[0-9]{7,15}$/).withMessage('El teléfono debe contener entre 7 y 15 dígitos');

const validateStatus = (fieldName = 'estado') => 
  body(fieldName)
    .optional()
    .isBoolean().withMessage('El estado debe ser verdadero o falso');

const validateIdParam = () => 
  param('id')
    .notEmpty().withMessage('El ID es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo');

const validatePagination = () => [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un número entero positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100'),
];

const validateSorting = (allowedFields) => [
  query('sortBy')
    .optional()
    .isIn(allowedFields).withMessage(`Campo de ordenamiento inválido. Campos permitidos: ${allowedFields.join(', ')}`),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('El orden debe ser "asc" o "desc"'),
];

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

