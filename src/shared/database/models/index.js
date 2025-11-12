'use strict';

const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const process = require('process');

const env = process.env.NODE_ENV || 'development';
const config = require(path.resolve(__dirname, '..', '..', 'config', 'database.js'))[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const modelFactories = [
  require('../../../modules/operative/agenda/models/appointment'),
  require('../../../modules/operative/agenda/models/careunit'),
  require('../../../modules/operative/agenda/models/peopleattended'),
  require('../../../modules/operative/agenda/models/professional'),
  require('../../../modules/operative/agenda/models/schedule'),
  require('../../../modules/clinic/cases/models/clinicalnote'),
  require('../../../modules/clinic/cases/models/clinicalnoteversion'),
  require('../../../modules/clinic/cases/models/episode'),
  require('../../../modules/clinic/cases/models/diagnosis'),
  require('../../../modules/clinic/cases/models/consent'),
  require('../../../modules/platform/access/models/user'),
];

modelFactories.forEach(registerModel => {
  const model = registerModel(sequelize, DataTypes);
  db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.modules = {
  operative: {
    agenda: {
      Appointment: db.Appointment,
      CareUnit: db.CareUnit,
      PeopleAttended: db.PeopleAttended,
      Professional: db.Professional,
      Schedule: db.Schedule,
    },
  },
  clinic: {
    cases: {
      ClinicalNote: db.ClinicalNote,
      ClinicalNoteVersion: db.ClinicalNoteVersion,
      Episode: db.Episode,
      Diagnosis: db.Diagnosis,
      Consent: db.Consent,
    },
  },
  platform: {
    access: {
      User: db.User,
    },
  },
};

module.exports = db;
