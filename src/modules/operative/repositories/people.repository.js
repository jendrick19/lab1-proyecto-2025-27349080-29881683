const db = require('../../../../database/models');

const { PeopleAttended } = db.modules.operative;

/**
 * Busca una persona por su ID
 * @param {number} id - ID de la persona
 * @returns {Promise<Object|null>} Persona encontrada o null
 */
const findById = async (id) => {
  return PeopleAttended.findByPk(id);
};

/**
 * Busca y cuenta personas con filtros, paginación y ordenamiento
 * @param {Object} options - Opciones de búsqueda
 * @param {Object} options.where - Condiciones de búsqueda
 * @param {number} options.offset - Offset para paginación
 * @param {number} options.limit - Límite de registros
 * @param {Array} options.order - Orden de resultados
 * @returns {Promise<{count: number, rows: Array}>}
 */
const findAndCountAll = async ({ where, offset, limit, order }) => {
  return PeopleAttended.findAndCountAll({
    where,
    offset,
    limit,
    order,
  });
};

/**
 * Crea una nueva persona
 * @param {Object} payload - Datos de la persona
 * @returns {Promise<Object>} Persona creada
 */
const create = async (payload) => {
  return PeopleAttended.create(payload);
};

/**
 * Actualiza una persona existente
 * @param {Object} person - Instancia de la persona
 * @param {Object} payload - Datos a actualizar
 * @returns {Promise<Object>} Persona actualizada
 */
const update = async (person, payload) => {
  return person.update(payload);
};

/**
 * Guarda cambios en una persona
 * @param {Object} person - Instancia de la persona
 * @returns {Promise<Object>} Persona guardada
 */
const save = async (person) => {
  return person.save();
};

module.exports = {
  findById,
  findAndCountAll,
  create,
  update,
  save,
};

