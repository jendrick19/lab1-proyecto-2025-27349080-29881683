/**
 * Helper para validaciones médicas estándar
 */

/**
 * Regex para validar formato CIE-10
 * Formato: Letra(A-Z) + 2 dígitos + opcional(. + 1-2 dígitos)
 * Ejemplos válidos: J06.9, I10, E11.9, M54.5, A00.0
 */
const CIE10_REGEX = /^[A-Z]\d{2}(\.\d{1,2})?$/;

/**
 * Valida si un código cumple con el formato CIE-10
 * @param {string} code - Código a validar
 * @returns {boolean} True si es válido, false si no
 */
const isValidCIE10Code = (code) => {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  return CIE10_REGEX.test(code);
};

/**
 * Valida y normaliza un código CIE-10
 * @param {string} code - Código a validar
 * @returns {string} Código normalizado en mayúsculas
 * @throws {Error} Si el código no es válido
 */
const validateAndNormalizeCIE10Code = (code) => {
  if (!code || typeof code !== 'string') {
    throw new Error('El código CIE-10 es requerido');
  }

  const normalizedCode = code.trim().toUpperCase();

  if (!CIE10_REGEX.test(normalizedCode)) {
    throw new Error(
      'Código CIE-10 inválido. Formato esperado: Letra + 2 dígitos + opcional (.dígitos). ' +
      'Ejemplos: J06.9, I10, E11.9'
    );
  }

  return normalizedCode;
};

/**
 * Obtiene la categoría principal de un código CIE-10
 * @param {string} code - Código CIE-10 completo (ej. "J06.9")
 * @returns {string} Categoría principal (ej. "J06")
 */
const getCIE10Category = (code) => {
  if (!isValidCIE10Code(code)) {
    throw new Error('Código CIE-10 inválido');
  }

  // Extraer letra + 2 dígitos
  return code.substring(0, 3);
};

/**
 * Verifica si un código CIE-10 tiene subcategoría
 * @param {string} code - Código CIE-10
 * @returns {boolean} True si tiene subcategoría (ej. ".9" en "J06.9")
 */
const hasSubcategory = (code) => {
  if (!isValidCIE10Code(code)) {
    return false;
  }

  return code.includes('.');
};

module.exports = {
  CIE10_REGEX,
  isValidCIE10Code,
  validateAndNormalizeCIE10Code,
  getCIE10Category,
  hasSubcategory,
};

