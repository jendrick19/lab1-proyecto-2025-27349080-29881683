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
  require('../../src/modules/clinic/models/order'),
  require('../../src/modules/clinic/models/orderItem'),
  require('../../src/modules/clinic/models/result'),
  require('../../src/modules/clinic/models/resultversion'),
  require('../../src/modules/platform/models/user'),
  require('../../src/modules/platform/models/notification'),
  require('../../src/modules/platform/models/accesslog'),
  require('../../src/modules/platform/models/role'),
  require('../../src/modules/platform/models/permission'),
  require('../../src/modules/platform/models/userrole'),
  require('../../src/modules/platform/models/rolepermission'),
  require('../../src/modules/bussines/models/insurer'),
  require('../../src/modules/bussines/models/plan'),
  require('../../src/modules/bussines/models/affiliation'),
  require('../../src/modules/bussines/models/authorization'),
  require('../../src/modules/bussines/models/service'),
  require('../../src/modules/bussines/models/tariff'),
  require('../../src/modules/bussines/models/invoice'),
  require('../../src/modules/bussines/models/invoiceitem'),
  require('../../src/modules/bussines/models/payment'),
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
    Order: db.Order,
    OrderItem: db.OrderItem,
    Result: db.Result,
    ResultVersion: db.ResultVersion,
  },
  platform: {
    User: db.User,
    Notification: db.Notification,
    AccessLog: db.AccessLog,
    Role: db.Role,
    Permission: db.Permission,
    UserRole: db.UserRole,
    RolePermission: db.RolePermission,
  },
  bussines: {
    Insurer: db.Insurer,
    Plan: db.Plan,
    Affiliation: db.Affiliation,
    Authorization: db.Authorization,
    Service: db.Service,
    Tariff: db.Tariff,
    Invoice: db.Invoice,
    InvoiceItem: db.InvoiceItem,
    Payment: db.Payment,
  },
};
module.exports = db;
