const { Op } = require('sequelize');
const buildDateRangeFilter = (fieldName, fechaDesde, fechaHasta) => {
  if (!fechaDesde && !fechaHasta) {
    return null;
  }
  const filter = {};
  if (fechaDesde) {
    filter[Op.gte] = new Date(fechaDesde);
  }
  if (fechaHasta) {
    // Asegurar que la comparación incluye todo el día indicado independientemente
    // de la hora/zonas horarias: fijamos la fecha al final del día y usamos <=.
    const endDate = new Date(fechaHasta);
    endDate.setHours(23, 59, 59, 999);
    filter[Op.lte] = endDate;
  }
  return filter;
};

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
