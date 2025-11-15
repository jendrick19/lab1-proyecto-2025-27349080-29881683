const { Op } = require('sequelize');
const peopleRepository = require('../repositories/people.repository');

const SORT_FIELDS = {
  nombres: 'names',
  apellidos: 'surNames',
  fechaNacimiento: 'dateOfBirth',
  createdAt: 'createdAt',
};

const buildAgeFilter = (age) => {
  if (Number.isNaN(age)) {
    return null;
  }

  const today = new Date();
  const start = new Date(today);
  start.setFullYear(today.getFullYear() - (age + 1));
  start.setDate(start.getDate() + 1);

  const end = new Date(today);
  end.setFullYear(today.getFullYear() - age);

  return {
    [Op.between]: [start, end],
  };
};

const buildWhere = ({ documento, edad, sexo, nombre, estado }) => {
  const where = {};

  if (documento) {
    where.documentId = {
      [Op.like]: `%${documento}%`,
    };
  }

  if (sexo) {
    where.gender = sexo;
  }

  if (nombre) {
    where[Op.or] = [
      {
        names: {
          [Op.like]: `%${nombre}%`,
        },
      },
      {
        surNames: {
          [Op.like]: `%${nombre}%`,
        },
      },
    ];
  }

  if (edad !== undefined) {
    const ageNumber = Number(edad);
    const dateFilter = buildAgeFilter(ageNumber);

    if (dateFilter) {
      where.dateOfBirth = dateFilter;
    }
  }

  if (estado !== undefined) {
    if (typeof estado === 'string') {
      where.status = ['true', '1', 'activo', 'active'].includes(estado.toLowerCase());
    } else {
      where.status = Boolean(estado);
    }
  } else {
    where.status = true;
  }

  return where;
};

const listPeople = async ({
  page,
  limit,
  filters,
  sortBy,
  sortOrder,
}) => {
  const safePage = Number.isNaN(Number(page)) || Number(page) < 1 ? 1 : Number(page);
  const safeLimit = Number.isNaN(Number(limit)) || Number(limit) < 1 ? 20 : Math.min(Number(limit), 100);
  const offset = (safePage - 1) * safeLimit;

  const orderField = SORT_FIELDS[sortBy] || SORT_FIELDS.apellidos;
  const orderDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const where = buildWhere(filters);

  const { count, rows } = await peopleRepository.findAndCountAll({
    where,
    offset,
    limit: safeLimit,
    order: [[orderField, orderDirection]],
  });

  return {
    rows,
    count,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: count,
      totalPages: Math.ceil(count / safeLimit) || 0,
    },
  };
};

const getPersonById = async (id) => {
  return peopleRepository.findById(id);
};

const createPerson = async (payload) => {
  return peopleRepository.create(payload);
};

const updatePerson = async (person, payload) => {
  return peopleRepository.update(person, payload);
};

const softDeletePerson = async (person) => {
  person.status = false;
  return peopleRepository.save(person);
};

module.exports = {
  listPeople,
  getPersonById,
  createPerson,
  updatePerson,
  softDeletePerson,
};
