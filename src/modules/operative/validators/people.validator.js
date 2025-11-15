const { body, param, query, validationResult } = require('express-validator');
const peopleRepository = require('../repositories/people.repository');

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
 * Validación personalizada para verificar si el documento ya existe
 */
const checkDocumentUniqueness = async (value, { req }) => {
  const { Op } = require('sequelize');
  const db = require('../../../../database/models');
  const { PeopleAttended } = db.modules.operative;

  const where = {
    documentId: value,
  };

  // Si es una actualización, excluir el registro actual
  if (req.params?.id) {
    where.id = { [Op.ne]: req.params.id };
  }

  const existingPerson = await PeopleAttended.findOne({ where });

  if (existingPerson) {
    throw new Error('El número de documento ya está registrado');
  }

  return true;
};

/**
 * Validaciones para crear una persona
 */
const validateCreate = [
  body('id')
    .notEmpty().withMessage('El ID es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),

  body('tipoDocumento')
    .notEmpty().withMessage('El tipo de documento es requerido')
    .isIn(['Cedula', 'RIF', 'Pasaporte', 'Otro']).withMessage('Tipo de documento inválido'),

  body('numeroDocumento')
    .notEmpty().withMessage('El número de documento es requerido')
    .isLength({ min: 5, max: 20 }).withMessage('El número de documento debe tener entre 5 y 20 caracteres')
    .matches(/^[0-9A-Za-z]+$/).withMessage('El número de documento solo puede contener letras y números')
    .custom(checkDocumentUniqueness),

  body('nombres')
    .notEmpty().withMessage('Los nombres son requeridos')
    .isLength({ min: 2, max: 100 }).withMessage('Los nombres deben tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/).withMessage('Los nombres solo pueden contener letras'),

  body('apellidos')
    .notEmpty().withMessage('Los apellidos son requeridos')
    .isLength({ min: 2, max: 100 }).withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/).withMessage('Los apellidos solo pueden contener letras'),

  body('fechaNacimiento')
    .notEmpty().withMessage('La fecha de nacimiento es requerida')
    .isISO8601().withMessage('La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 0 || age > 120) {
        throw new Error('La edad debe estar entre 0 y 120 años');
      }
      
      return true;
    }),

  body('sexo')
    .notEmpty().withMessage('El sexo es requerido')
    .isIn(['M', 'F', 'O']).withMessage('El sexo debe ser M (Masculino), F (Femenino) u O (Otro)'),

  body('telefono')
    .optional()
    .matches(/^\+?[0-9]{7,15}$/).withMessage('El teléfono debe contener entre 7 y 15 dígitos'),

  body('correo')
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('El correo debe ser una dirección válida')
    .normalizeEmail(),

  body('direccion')
    .notEmpty().withMessage('La dirección es requerida')
    .isLength({ min: 5, max: 200 }).withMessage('La dirección debe tener entre 5 y 200 caracteres'),

  body('contactoEmergencia')
    .notEmpty().withMessage('El contacto de emergencia es requerido')
    .isLength({ min: 5, max: 200 }).withMessage('El contacto de emergencia debe tener entre 5 y 200 caracteres'),

  body('alergias')
    .optional()
    .isLength({ max: 500 }).withMessage('Las alergias no pueden superar los 500 caracteres'),

  body('estado')
    .optional()
    .isBoolean().withMessage('El estado debe ser verdadero o falso'),

  handleValidationErrors,
];

/**
 * Validaciones para actualizar una persona
 * Los campos son opcionales, pero si se envían deben ser válidos
 */
const validateUpdate = [
  param('id')
    .notEmpty().withMessage('El ID es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),

  body('tipoDocumento')
    .optional()
    .isIn(['Cedula', 'RIF', 'Pasaporte', 'Otro']).withMessage('Tipo de documento inválido'),

  body('numeroDocumento')
    .optional()
    .isLength({ min: 5, max: 20 }).withMessage('El número de documento debe tener entre 5 y 20 caracteres')
    .matches(/^[0-9A-Za-z]+$/).withMessage('El número de documento solo puede contener letras y números')
    .custom(checkDocumentUniqueness),

  body('nombres')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Los nombres deben tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/).withMessage('Los nombres solo pueden contener letras'),

  body('apellidos')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/).withMessage('Los apellidos solo pueden contener letras'),

  body('fechaNacimiento')
    .optional()
    .isISO8601().withMessage('La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 0 || age > 120) {
        throw new Error('La edad debe estar entre 0 y 120 años');
      }
      
      return true;
    }),

  body('sexo')
    .optional()
    .isIn(['M', 'F', 'O']).withMessage('El sexo debe ser M (Masculino), F (Femenino) u O (Otro)'),

  body('telefono')
    .optional()
    .matches(/^\+?[0-9]{7,15}$/).withMessage('El teléfono debe contener entre 7 y 15 dígitos'),

  body('correo')
    .optional()
    .isEmail().withMessage('El correo debe ser una dirección válida')
    .normalizeEmail(),

  body('direccion')
    .optional()
    .isLength({ min: 5, max: 200 }).withMessage('La dirección debe tener entre 5 y 200 caracteres'),

  body('contactoEmergencia')
    .optional()
    .isLength({ min: 5, max: 200 }).withMessage('El contacto de emergencia debe tener entre 5 y 200 caracteres'),

  body('alergias')
    .optional()
    .isLength({ max: 500 }).withMessage('Las alergias no pueden superar los 500 caracteres'),

  body('estado')
    .optional()
    .isBoolean().withMessage('El estado debe ser verdadero o falso'),

  handleValidationErrors,
];

/**
 * Validaciones para obtener/eliminar una persona por ID
 */
const validateId = [
  param('id')
    .notEmpty().withMessage('El ID es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),

  handleValidationErrors,
];

/**
 * Validaciones para listar personas (query params)
 */
const validateList = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un número entero positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100'),

  query('sortBy')
    .optional()
    .isIn(['nombres', 'apellidos', 'fechaNacimiento', 'createdAt']).withMessage('Campo de ordenamiento inválido'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('El orden debe ser "asc" o "desc"'),

  query('documento')
    .optional()
    .isLength({ min: 1, max: 20 }).withMessage('El documento debe tener entre 1 y 20 caracteres'),

  query('edad')
    .optional()
    .isInt({ min: 0, max: 120 }).withMessage('La edad debe ser un número entre 0 y 120'),

  query('sexo')
    .optional()
    .isIn(['M', 'F', 'O']).withMessage('El sexo debe ser M, F u O'),

  query('nombre')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('El nombre debe tener entre 1 y 100 caracteres'),

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

