const { body } = require('express-validator');
const { handleValidationErrors, validateEmail } = require('../../../shared/validators/CommonValidator');
const db = require('../../../../database/models');
const { User } = db.modules.platform;

/**
 * Verifica que el username no esté en uso
 */
const checkUsernameUniqueness = async (value) => {
  const existingUser = await User.findOne({
    where: { username: value },
  });

  if (existingUser) {
    throw new Error('El nombre de usuario ya está registrado');
  }

  return true;
};

/**
 * Verifica que el email no esté en uso
 */
const checkEmailUniqueness = async (value) => {
  const existingUser = await User.findOne({
    where: { email: value },
  });

  if (existingUser) {
    throw new Error('El correo electrónico ya está registrado');
  }

  return true;
};

/**
 * Validaciones para login
 */
const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .trim(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 1 })
    .withMessage('La contraseña no puede estar vacía'),

  handleValidationErrors,
];

/**
 * Validaciones para registro
 */
const validateRegister = [
  body('username')
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos')
    .trim()
    .custom(checkUsernameUniqueness),

  validateEmail('email').custom(checkEmailUniqueness),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),

  body('status')
    .optional()
    .isBoolean()
    .withMessage('El estado debe ser verdadero o falso'),

  handleValidationErrors,
];

/**
 * Validaciones para refresh token
 */
const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('El refresh token es requerido')
    .isString()
    .withMessage('El refresh token debe ser una cadena de texto'),

  handleValidationErrors,
];

module.exports = {
  validateLogin,
  validateRegister,
  validateRefreshToken,
};

