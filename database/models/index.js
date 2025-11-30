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
  require('../../src/modules/operative/models/Appointment'),
  require('../../src/modules/operative/models/AppointmentHistory'),
  require('../../src/modules/operative/models/CareUnit'),
  require('../../src/modules/operative/models/PeopleAttended'),
  require('../../src/modules/operative/models/Professional'),
  require('../../src/modules/operative/models/Schedule'),
  require('../../src/modules/clinic/models/ClinicalNote'),
  require('../../src/modules/clinic/models/ClinicalNoteVersion'),
  require('../../src/modules/clinic/models/Episode'),
  require('../../src/modules/clinic/models/Diagnosis'),
  require('../../src/modules/clinic/models/Consent'),
  require('../../src/modules/platform/models/User'),
  require('../../src/modules/platform/models/Role'),
  require('../../src/modules/platform/models/Permission'),
  require('../../src/modules/platform/models/UserRole'),
  require('../../src/modules/platform/models/RolePermission'),
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
    Role: db.Role,
    Permission: db.Permission,
    UserRole: db.UserRole,
    RolePermission: db.RolePermission,
  },
};

module.exports = db;

