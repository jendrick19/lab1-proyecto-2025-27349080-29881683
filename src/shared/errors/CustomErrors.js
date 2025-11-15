/**
 * Error base personalizado
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error 400 - Bad Request
 * Para errores de validación de datos de entrada
 */
class ValidationError extends AppError {
  constructor(message = 'Datos de entrada inválidos') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * Error 404 - Not Found
 * Para recursos que no existen
 */
class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Error 409 - Conflict
 * Para conflictos de recursos duplicados
 */
class ConflictError extends AppError {
  constructor(message = 'El recurso ya existe') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Error 422 - Unprocessable Entity
 * Para errores de lógica de negocio
 */
class BusinessLogicError extends AppError {
  constructor(message = 'Error en la lógica de negocio') {
    super(message, 422);
    this.name = 'BusinessLogicError';
  }
}

/**
 * Error 500 - Internal Server Error
 * Para errores internos del servidor
 */
class InternalError extends AppError {
  constructor(message = 'Error interno del servidor') {
    super(message, 500);
    this.name = 'InternalError';
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  BusinessLogicError,
  InternalError,
};

