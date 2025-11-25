const { Op } = require('sequelize');
const db = require('../../../../database/models');

const { Episode } = db.modules.clinic;
const { PeopleAttended } = db.modules.operative;


const findById = async (id) => {
  return Episode.findByPk(id, {
    include: [
      { model: db.modules.operative.PeopleAttended, as: 'peopleAttended' },
      { model: db.modules.clinic.ClinicalNote, as: 'clinicalNotes' },
      { model: db.modules.clinic.Diagnosis, as: 'diagnosis' }
    ]
  });
};


const findAndCountAll = async ({ where, offset, limit, order, include }) => {
  const defaultInclude = [
    { model: db.modules.operative.PeopleAttended, as: 'peopleAttended' },
    { model: db.modules.clinic.ClinicalNote, as: 'clinicalNotes' },
    { model: db.modules.clinic.Diagnosis, as: 'diagnosis' }
  ];

  return Episode.findAndCountAll({
    where,
    offset,
    limit,
    order,
    include: include || defaultInclude,
    distinct: true,
  });
};


const findByPatientName = async (searchTerm, { offset, limit, order } = {}) => {
  const whereCondition = {
    [Op.or]: [
      { names: { [Op.like]: `%${searchTerm}%` } },
      { surNames: { [Op.like]: `%${searchTerm}%` } },
      { 
        [Op.and]: [
          { names: { [Op.like]: `%${searchTerm.split(' ')[0]}%` } },
          { surNames: { [Op.like]: `%${searchTerm.split(' ')[1] || ''}%` } }
        ]
      }
    ]
  };

  return Episode.findAndCountAll({
    include: [
      {
        model: PeopleAttended,
        as: 'peopleAttended',
        where: whereCondition,
        required: true
      },
      { model: db.modules.clinic.ClinicalNote, as: 'clinicalNotes' },
      { model: db.modules.clinic.Diagnosis, as: 'diagnosis' }
    ],
    offset,
    limit,
    order: order || [['openingDate', 'DESC']],
    distinct: true,
  });
};


const findByPatientDocument = async (documentType, documentId, { offset, limit, order } = {}) => {
  return Episode.findAndCountAll({
    include: [
      {
        model: PeopleAttended,
        as: 'peopleAttended',
        where: {
          documentType,
          documentId
        },
        required: true
      },
      { model: db.modules.clinic.ClinicalNote, as: 'clinicalNotes' },
      { model: db.modules.clinic.Diagnosis, as: 'diagnosis' }
    ],
    offset,
    limit,
    order: order || [['openingDate', 'DESC']],
    distinct: true,
  });
};


const findByStatus = async (status, { offset, limit, order } = {}) => {
  return Episode.findAndCountAll({
    where: { status },
    include: [
      { model: db.modules.operative.PeopleAttended, as: 'peopleAttended' },
      { model: db.modules.clinic.ClinicalNote, as: 'clinicalNotes' },
      { model: db.modules.clinic.Diagnosis, as: 'diagnosis' }
    ],
    offset,
    limit,
    order: order || [['openingDate', 'DESC']],
    distinct: true,
  });
};


const create = async (payload) => {
  return Episode.create(payload);
};


const update = async (episode, payload) => {
  return episode.update(payload);
};


const save = async (episode) => {
  return episode.save();
};


module.exports = {
  findById,
  findAndCountAll,
  findByPatientName,
  findByPatientDocument,
  findByStatus,
  create,
  update,
  save,
};

