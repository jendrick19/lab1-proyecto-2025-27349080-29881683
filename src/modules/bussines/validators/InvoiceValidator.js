const { body, param, query } = require('express-validator');
const {
  handleValidationErrors,
  validateIdParam,
  validatePagination,
  validateSorting,
} = require('../../../shared/validators/CommonValidator');

const db = require('../../../../database/models');
const { PeopleAttended } = db.modules.operative;
const { Insurer } = db.modules.bussines;
const invoiceRepository = require('../repositories/InvoiceRepository');

const checkPeopleExists = async (value) => {
  const person = await PeopleAttended.findByPk(value);
  if (!person) {
    throw new Error('La persona especificada no existe');
  }
  if (!person.status) {
    throw new Error('La persona especificada está inactiva');
  }
  return true;
};

const checkInsurerExists = async (value) => {
  const insurer = await Insurer.findByPk(value);
  if (!insurer) {
    throw new Error('La aseguradora especificada no existe');
  }
  if (insurer.estado !== 'activo') {
    throw new Error('La aseguradora especificada está inactiva');
  }
  return true;
};

const checkInvoiceNumberUniqueness = async (value, { req }) => {
  if (!value) return true;
  const { Op } = require('sequelize');
  const Invoice = db.modules.bussines.Invoice;
  const where = { number: value };
  if (req.params?.id) {
    where.id = { [Op.ne]: req.params.id };
  }
  const existingInvoice = await Invoice.findOne({ where });
  if (existingInvoice) {
    throw new Error('Ya existe una factura con este número');
  }
  return true;
};

const validateTotals = (value, { req }) => {
  const subTotal = req.body.subTotal || 0;
  const impuestos = req.body.impuestos || 0;
  const total = req.body.total || 0;
  const calculatedTotal = subTotal + impuestos;
  
  if (Math.abs(calculatedTotal - total) > 0.01) {
    throw new Error(`El total debe ser igual a subTotal + impuestos (${calculatedTotal} vs ${total})`);
  }
  return true;
};

const validateItems = (items) => {
  if (!Array.isArray(items)) {
    throw new Error('Los items deben ser un array');
  }
  if (items.length === 0) {
    return true;
  }
  for (const item of items) {
    if (!item.prestacionCodigo) {
      throw new Error('Cada item debe tener un código de prestación');
    }
    if (!item.cantidad || item.cantidad <= 0) {
      throw new Error('Cada item debe tener una cantidad válida mayor a 0');
    }
    if (!item.valorUnitario || item.valorUnitario <= 0) {
      throw new Error('Cada item debe tener un valor unitario válido mayor a 0');
    }
  }
  return true;
};

const validateCreate = [
  body('numero')
    .notEmpty().withMessage('El número de factura es requerido')
    .isLength({ min: 1, max: 50 }).withMessage('El número de factura debe tener entre 1 y 50 caracteres')
    .trim()
    .custom(checkInvoiceNumberUniqueness),
  body('personaId')
    .notEmpty().withMessage('La persona es requerida')
    .isInt({ min: 1 }).withMessage('El ID de persona debe ser un número entero válido')
    .custom(checkPeopleExists),
  body('aseguradoraId')
    .notEmpty().withMessage('La aseguradora es requerida')
    .isInt({ min: 1 }).withMessage('El ID de aseguradora debe ser un número entero válido')
    .custom(checkInsurerExists),
  body('moneda')
    .optional()
    .isIn(['VES', 'USD', 'EUR']).withMessage('La moneda debe ser VES, USD o EUR'),
  body('estado')
    .optional()
    .isIn(['emitida', 'pagada', 'pendiente', 'anulada']).withMessage('Estado inválido'),
  body('fechaEmision')
    .optional()
    .isISO8601().withMessage('La fecha de emisión debe ser una fecha válida (formato ISO 8601)')
    .toDate(),
  body('subTotal')
    .optional()
    .isFloat({ min: 0 }).withMessage('El subtotal debe ser un número positivo'),
  body('impuestos')
    .optional()
    .isFloat({ min: 0 }).withMessage('Los impuestos deben ser un número positivo'),
  body('total')
    .optional()
    .isFloat({ min: 0 }).withMessage('El total debe ser un número positivo')
    .custom(validateTotals),
  body('items')
    .optional()
    .isArray().withMessage('Los items deben ser un array')
    .custom(validateItems),
  handleValidationErrors,
];

const validateUpdate = [
  validateIdParam(),
  body('numero')
    .optional()
    .isLength({ min: 1, max: 50 }).withMessage('El número de factura debe tener entre 1 y 50 caracteres')
    .trim()
    .custom(checkInvoiceNumberUniqueness),
  body('personaId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de persona debe ser un número entero válido')
    .custom(checkPeopleExists),
  body('aseguradoraId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de aseguradora debe ser un número entero válido')
    .custom(checkInsurerExists),
  body('moneda')
    .optional()
    .isIn(['VES', 'USD', 'EUR']).withMessage('La moneda debe ser VES, USD o EUR'),
  body('estado')
    .optional()
    .isIn(['emitida', 'pagada', 'pendiente', 'anulada']).withMessage('Estado inválido'),
  body('fechaEmision')
    .optional()
    .isISO8601().withMessage('La fecha de emisión debe ser una fecha válida (formato ISO 8601)')
    .toDate(),
  body('subTotal')
    .optional()
    .isFloat({ min: 0 }).withMessage('El subtotal debe ser un número positivo'),
  body('impuestos')
    .optional()
    .isFloat({ min: 0 }).withMessage('Los impuestos deben ser un número positivo'),
  body('total')
    .optional()
    .isFloat({ min: 0 }).withMessage('El total debe ser un número positivo')
    .custom(validateTotals),
  handleValidationErrors,
];

const validateId = [
  validateIdParam(),
  handleValidationErrors,
];

const validateList = [
  ...validatePagination(),
  ...validateSorting(['numero', 'fechaEmision', 'total', 'estado', 'createdAt']),
  query('numero')
    .optional()
    .isLength({ min: 1, max: 50 }).withMessage('El número de factura debe tener entre 1 y 50 caracteres'),
  query('personaId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de persona debe ser un número entero válido'),
  query('aseguradoraId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de aseguradora debe ser un número entero válido'),
  query('estado')
    .optional()
    .isIn(['emitida', 'pagada', 'pendiente', 'anulada']).withMessage('Estado inválido'),
  query('moneda')
    .optional()
    .isIn(['VES', 'USD', 'EUR']).withMessage('La moneda debe ser VES, USD o EUR'),
  query('fechaEmisionDesde')
    .optional()
    .isISO8601().withMessage('La fecha desde debe ser una fecha válida (formato ISO 8601)'),
  query('fechaEmisionHasta')
    .optional()
    .isISO8601().withMessage('La fecha hasta debe ser una fecha válida (formato ISO 8601)'),
  handleValidationErrors,
];

module.exports = {
  validateCreate,
  validateUpdate,
  validateId,
  validateList,
};

