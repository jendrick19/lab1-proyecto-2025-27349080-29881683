const db = require('../../../../database/models');
const { Op } = require('sequelize');

const { Schedule } = db.modules.operative;

const findById = async (id) => {
    return Schedule.findByPk(id, {
        include: [
            {
                association: 'professional',
                attributes: ['id', 'names', 'surNames', 'specialty']
            },
            {
                association: 'careUnit',
                attributes: ['id', 'name', 'address']
            }
        ]
    });
};

const findByProfessionalName = async (searchTerm, options = {}) => {
    return Schedule.findAll({
        include: [
            {
                association: 'professional',
                attributes: ['id', 'names', 'surNames', 'specialty'],
                where: {
                    [Op.or]: [
                        { names: { [Op.like]: `%${searchTerm}%` } },
                        { surNames: { [Op.like]: `%${searchTerm}%` } }
                    ]
                }
            },
            {
                association: 'careUnit',
                attributes: ['id', 'name', 'address']
            }
        ],
        where: options.status ? { status: options.status } : {},
        order: options.order || [['startTime', 'ASC']]
    });
};

const findByCareUnitName = async (searchTerm, options = {}) => {
    return Schedule.findAll({
        include: [
            {
                association: 'professional',
                attributes: ['id', 'names', 'surNames', 'specialty']
            },
            {
                association: 'careUnit',
                attributes: ['id', 'name', 'address'],
                where: {
                    name: { [Op.like]: `%${searchTerm}%` }
                }
            }
        ],
        where: options.status ? { status: options.status } : {},
        order: options.order || [['startTime', 'ASC']]
    });
};

const findAndCountAll = async ({ where, offset, limit, order }) => {
    return Schedule.findAndCountAll({
        where,
        offset,
        limit,
        order,
        include: [
            {
                association: 'professional',
                attributes: ['id', 'names', 'surNames', 'specialty']
            },
            {
                association: 'careUnit',
                attributes: ['id', 'name', 'address']
            }
        ]
    });
};

const findByProfessionalId = async (professionalId, options = {}) => {
    const where = { professionalId };
    
    if (options.status) {
        where.status = options.status;
    }
    
    return Schedule.findAll({
        where,
        order: options.order || [['startTime', 'ASC']],
        include: [
            {
                association: 'careUnit',
                attributes: ['id', 'name', 'address']
            }
        ]
    });
};

const findByUnitId = async (unitId, options = {}) => {
    const where = { unitId };
    
    if (options.status) {
        where.status = options.status;
    }
    
    return Schedule.findAll({
        where,
        order: options.order || [['startTime', 'ASC']],
        include: [
            {
                association: 'professional',
                attributes: ['id', 'names', 'surNames', 'specialty']
            }
        ]
    });
};

const create = async (payload) => {
    return Schedule.create(payload);
};

const update = async (schedule, payload) => {
    return schedule.update(payload);
};

const save = async (schedule) => {
    return schedule.save();
};

const changeStatus = async (schedule, status) => {
    return schedule.update({ status });
};

const deleteSchedule = async (schedule) => {
    return schedule.destroy();
};

module.exports = {
    findById,
    findByProfessionalName,
    findByCareUnitName,
    findAndCountAll,
    findByProfessionalId,
    findByUnitId,
    create,
    update,
    save,
    changeStatus,
    deleteSchedule,
};

