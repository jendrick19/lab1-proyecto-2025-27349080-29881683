const db = require('../../../../database/models');
const { Professional } = db.modules.operative;

const findById = async (id) => {
    return Professional.findByPk(id);
};

const findAndCountAll = async ({ where, offset, limit, order }) => {
    return Professional.findAndCountAll({
        where,
        offset,
        limit,
        order,
    });
};

const create = async (professionalData) => {
    return Professional.create({
        userId: professionalData.userId || null,
        names: professionalData.names,
        surNames: professionalData.surNames,
        professionalRegister: professionalData.professionalRegister,
        specialty: professionalData.specialty,
        email: professionalData.email,
        phone: professionalData.phone,
        scheduleEnabled: professionalData.scheduleEnabled !== undefined ? professionalData.scheduleEnabled : false,
        status: professionalData.status !== undefined ? professionalData.status : true
    });
};

const update = async (professional, payload) => {
    return professional.update(payload);
};

const changeStatus = async (professional) => {
    return professional.update({ status: false });
};

module.exports = {
    findById,
    findAndCountAll,
    create,
    update,
    changeStatus,
};