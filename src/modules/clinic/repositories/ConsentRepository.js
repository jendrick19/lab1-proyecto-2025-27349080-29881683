const { Op } = require('sequelize');
const db = require('../../../../database/models');

const { Consent } = db.modules.clinic;

const findById = async (id) => {
  return Consent.findByPk(id, {
    include: [
      { model: db.modules.operative.PeopleAttended, as: 'peopleAttended' }
    ]
  });
};

const findAndCountAll = async ({ where, offset, limit, order, include }) => {
  const defaultInclude = [
    { model: db.modules.operative.PeopleAttended, as: 'peopleAttended' }
  ];

  return Consent.findAndCountAll({
    where,
    offset,
    limit,
    order: order || [['consentDate', 'DESC']],
    include: include || defaultInclude,
    distinct: true,
  });
};

const findByPeopleDocument = async (documentId, { offset, limit, order } = {}) => {
  return Consent.findAndCountAll({
    include: [
      { 
        model: db.modules.operative.PeopleAttended, 
        as: 'peopleAttended',
        where: {
          documentId: documentId
        }
      }
    ],
    offset,
    limit,
    order: order || [['consentDate', 'DESC']],
    distinct: true,
  });
};

const countByPeopleDocument = async (documentId) => {
  return Consent.count({
    include: [
      { 
        model: db.modules.operative.PeopleAttended, 
        as: 'peopleAttended',
        where: {
          documentId: documentId
        },
        attributes: []
      }
    ]
  });
};

const create = async (payload) => {
  return Consent.create(payload);
};

const update = async (consent, payload) => {
  return consent.update(payload);
};

const save = async (consent) => {
  return consent.save();
};

const remove = async (consent) => {
  return consent.destroy();
};

const removeByPeople = async (peopleId) => {
  return Consent.destroy({
    where: { peopleId }
  });
};

module.exports = {
  findById,
  findAndCountAll,
  findByPeopleDocument,
  countByPeopleDocument,
  create,
  update,
  save,
  remove,
  removeByPeople,
};

