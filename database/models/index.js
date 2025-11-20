'use strict';

const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const process = require('process');

const env = process.env.NODE_ENV || 'development';
const config = require(path.resolve(__dirname, '..', 'config', 'database.js'))[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const modelFactories = [
  require('../../src/modules/operative/models/appointment'),
  require('../../src/modules/operative/models/appointmenthistory'),
  require('../../src/modules/operative/models/careunit'),
  require('../../src/modules/operative/models/peopleattended'),
  require('../../src/modules/operative/models/professional'),
  require('../../src/modules/operative/models/schedule'),
  require('../../src/modules/clinic/models/clinicalnote'),
  require('../../src/modules/clinic/models/clinicalnoteversion'),
  require('../../src/modules/clinic/models/episode'),
  require('../../src/modules/clinic/models/diagnosis'),
  require('../../src/modules/clinic/models/consent'),
  require('../../src/modules/platform/models/user'),
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
    Appointment: db.Appointment,
    AppointmentHistory: db.AppointmentHistory,
    CareUnit: db.CareUnit,
    PeopleAttended: db.PeopleAttended,
    Professional: db.Professional,
    Schedule: db.Schedule,
  },
  clinic: {
    ClinicalNote: db.ClinicalNote,
    ClinicalNoteVersion: db.ClinicalNoteVersion,
    Episode: db.Episode,
    Diagnosis: db.Diagnosis,
    Consent: db.Consent,
  },
  platform: {
    User: db.User,
  },
};

module.exports = db;

