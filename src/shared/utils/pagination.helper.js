
/**
 * Construye los parámetros de paginación validados
 * @param {number|string} page - Número de página
 * @param {number|string} limit - Límite de registros por página
 * @param {number} maxLimit - Límite máximo permitido (default: 100)
 * @param {number} defaultLimit - Límite por defecto (default: 20)
 * @returns {Object} { safePage, safeLimit, offset }
 */
const buildPaginationParams = (page, limit, maxLimit = 100, defaultLimit = 20) => {
  const safePage = Number.isNaN(Number(page)) || Number(page) < 1 ? 1 : Number(page);
  const safeLimit = Number.isNaN(Number(limit)) || Number(limit) < 1 
    ? defaultLimit 
    : Math.min(Number(limit), maxLimit);
  const offset = (safePage - 1) * safeLimit;

  return { safePage, safeLimit, offset };
};

/**
 * Construye la respuesta paginada estándar
 * @param {Array} rows - Registros retornados
 * @param {number} count - Total de registros
 * @param {number} page - Página actual
 * @param {number} limit - Límite por página
 * @returns {Object} Respuesta con rows, count y pagination
 */
const buildPaginationResponse = (rows, count, page, limit) => {
  return {
    rows,
    count,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit) || 0,
    },
  };
};

module.exports = {
  buildPaginationParams,
  buildPaginationResponse,
};

