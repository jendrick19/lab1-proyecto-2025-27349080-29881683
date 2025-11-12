const database = require('./models');

module.exports = {
  sequelize: database.sequelize,
  Sequelize: database.Sequelize,
  modules: database.modules,
  models: database,
};