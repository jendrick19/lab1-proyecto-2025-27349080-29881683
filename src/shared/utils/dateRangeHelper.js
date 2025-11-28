const { Op } = require('sequelize');

/**
 * Construye un filtro de rango de fechas para consultas Sequelize
 * @param {string} fieldName - Nombre del campo de fecha (ej: 'noteDate', 'openingDate', 'startTime')
 * @param {string} fechaDesde - Fecha de inicio del rango (ISO 8601)
 * @param {string} fechaHasta - Fecha de fin del rango (ISO 8601)
 * @returns {Object} Objeto con las condiciones Op.gte y Op.lt, o null si no hay fechas
 */
const buildDateRangeFilter = (fieldName, fechaDesde, fechaHasta) => {
  if (!fechaDesde && !fechaHasta) {
    return null;
  }

  const filter = {};

  if (fechaDesde) {
    filter[Op.gte] = new Date(fechaDesde);
  }

  if (fechaHasta) {
    // Incluir todo el día: usar el día siguiente con Op.lt (menor que)
    const endDate = new Date(fechaHasta);
    endDate.setDate(endDate.getDate() + 1);
    filter[Op.lt] = endDate;
  }

  return filter;
};

/**
 * Agrega un filtro de rango de fechas al objeto where si aplica
 * @param {Object} where - Objeto where de Sequelize a modificar
 * @param {string} fieldName - Nombre del campo de fecha
 * @param {string} fechaDesde - Fecha de inicio del rango (ISO 8601)
 * @param {string} fechaHasta - Fecha de fin del rango (ISO 8601)
 */
const addDateRangeToWhere = (where, fieldName, fechaDesde, fechaHasta) => {
  const dateFilter = buildDateRangeFilter(fieldName, fechaDesde, fechaHasta);
  
  if (dateFilter) {
    where[fieldName] = dateFilter;
  }
};

module.exports = {
  buildDateRangeFilter,
  addDateRangeToWhere,
};

