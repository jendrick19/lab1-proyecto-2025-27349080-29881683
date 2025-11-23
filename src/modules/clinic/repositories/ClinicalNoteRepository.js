const { Op } = require('sequelize');
const db = require('../../../../database/models');

const { ClinicalNote, ClinicalNoteVersion } = db.modules.clinic;

const findById = async (id) => {
  return ClinicalNote.findByPk(id, {
    include: [
      { model: db.modules.operative.Professional, as: 'professional' },
      { model: db.modules.clinic.Episode, as: 'episode' },
      { model: db.modules.clinic.ClinicalNoteVersion, as: 'clinicalNoteVersions' }
    ]
  });
};

const findAndCountAll = async ({ where, offset, limit, order, include }) => {
  const defaultInclude = [
    { model: db.modules.operative.Professional, as: 'professional' },
    { model: db.modules.clinic.Episode, as: 'episode' },
    { model: db.modules.clinic.ClinicalNoteVersion, as: 'clinicalNoteVersions' }
  ];

  return ClinicalNote.findAndCountAll({
    where,
    offset,
    limit,
    order: order || [['noteDate', 'DESC']],
    include: include || defaultInclude,
    distinct: true,
  });
};

const findByEpisode = async (episodeId, { offset, limit, order } = {}) => {
  return ClinicalNote.findAndCountAll({
    where: { episodeId },
    include: [
      { model: db.modules.operative.Professional, as: 'professional' },
      { model: db.modules.clinic.ClinicalNoteVersion, as: 'clinicalNoteVersions' }
    ],
    offset,
    limit,
    order: order || [['noteDate', 'DESC']],
    distinct: true,
  });
};

const findByProfessional = async (professionalId, { offset, limit, order } = {}) => {
  return ClinicalNote.findAndCountAll({
    where: { professionalId },
    include: [
      { model: db.modules.clinic.Episode, as: 'episode' },
      { model: db.modules.clinic.ClinicalNoteVersion, as: 'clinicalNoteVersions' }
    ],
    offset,
    limit,
    order: order || [['noteDate', 'DESC']],
    distinct: true,
  });
};

const findByDateRange = async (startDate, endDate, { offset, limit, order } = {}) => {
  return ClinicalNote.findAndCountAll({
    where: {
      noteDate: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      { model: db.modules.operative.Professional, as: 'professional' },
      { model: db.modules.clinic.Episode, as: 'episode' },
      { model: db.modules.clinic.ClinicalNoteVersion, as: 'clinicalNoteVersions' }
    ],
    offset,
    limit,
    order: order || [['noteDate', 'DESC']],
    distinct: true,
  });
};

const create = async (payload) => {
  return ClinicalNote.create(payload);
};

const createWithVersion = async (noteData, versionData, transaction = null) => {
  const note = await ClinicalNote.create(noteData, { transaction });
  
  await ClinicalNoteVersion.create({
    noteId: note.id,
    ...versionData
  }, { transaction });

  return findById(note.id);
};

const update = async (note, payload) => {
  return note.update(payload);
};

const save = async (note) => {
  return note.save();
};

const findVersionById = async (versionId) => {
  return ClinicalNoteVersion.findByPk(versionId, {
    include: [
      { 
        model: db.modules.clinic.ClinicalNote, 
        as: 'clinicalNote',
        include: [
          { model: db.modules.operative.Professional, as: 'professional' }
        ]
      }
    ]
  });
};

const findVersionsByNoteId = async (noteId) => {
  return ClinicalNoteVersion.findAll({
    where: { noteId },
    order: [['versionDate', 'DESC']]
  });
};

const findLatestVersion = async (noteId) => {
  return ClinicalNoteVersion.findOne({
    where: { noteId },
    order: [['versionDate', 'DESC']]
  });
};

const createVersion = async (noteId, versionData, transaction = null) => {
  return ClinicalNoteVersion.create({
    noteId,
    ...versionData
  }, { transaction });
};


const updateVersion = async (version, payload) => {
  return version.update(payload);
};

const countVersions = async (noteId) => {
  return ClinicalNoteVersion.count({ where: { noteId } });
};

module.exports = {
  findById,
  findAndCountAll,
  findByEpisode,
  findByProfessional,
  findByDateRange,
  create,
  createWithVersion,
  update,
  save,
  findVersionById,
  findVersionsByNoteId,
  findLatestVersion,
  createVersion,
  updateVersion,
  countVersions,
};

