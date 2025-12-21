const { Op } = require('sequelize');
const db = require('../../../../database/models');
const { Tariff } = db.modules.bussines;

const findById = async (id) => {
  return Tariff.findByPk(id, {
    include: [
      { model: db.modules.bussines.Service, as: 'service' },
      { model: db.modules.bussines.Plan, as: 'plan', required: false }
    ]
  });
};

const findAndCountAll = async ({ where, offset, limit, order }) => {
  return Tariff.findAndCountAll({
    where,
    offset,
    limit,
    order,
    include: [
      { model: db.modules.bussines.Service, as: 'service' },
      { model: db.modules.bussines.Plan, as: 'plan', required: false }
    ],
    distinct: true,
  });
};

// Buscar tarifa activa para una prestación y plan específico
// Si no hay tarifa específica del plan, busca la tarifa general (planId = null)
const findActiveTariff = async (serviceCode, planId = null) => {
  const today = new Date();
  
  // Primero buscar tarifa específica del plan
  if (planId) {
    const specificTariff = await Tariff.findOne({
      where: {
        serviceCode,
        planId,
        effectiveFrom: { [Op.lte]: today },
        [Op.or]: [
          { effectiveTo: null },
          { effectiveTo: { [Op.gte]: today } }
        ]
      },
      include: [
        { model: db.modules.bussines.Service, as: 'service' },
        { model: db.modules.bussines.Plan, as: 'plan' }
      ],
      order: [['effectiveFrom', 'DESC']]
    });
    
    if (specificTariff) {
      return specificTariff;
    }
  }
  
  // Si no hay tarifa específica, buscar tarifa general (planId = null)
  const generalTariff = await Tariff.findOne({
    where: {
      serviceCode,
      planId: null,
      effectiveFrom: { [Op.lte]: today },
      [Op.or]: [
        { effectiveTo: null },
        { effectiveTo: { [Op.gte]: today } }
      ]
    },
    include: [
      { model: db.modules.bussines.Service, as: 'service' }
    ],
    order: [['effectiveFrom', 'DESC']]
  });
  
  return generalTariff;
};

const create = async (payload) => {
  return Tariff.create(payload);
};

const update = async (tariff, payload) => {
  return tariff.update(payload);
};

module.exports = {
  findById,
  findAndCountAll,
  findActiveTariff,
  create,
  update,
};

