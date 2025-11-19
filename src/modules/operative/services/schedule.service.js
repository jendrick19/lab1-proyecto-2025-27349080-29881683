const scheduleRepository = require('../repositories/schedule.repository');
const { buildPaginationParams, buildPaginationResponse } = require('../../../shared/utils/pagination.helper');
const { NotFoundError, BusinessLogicError } = require('../../../shared/errors/CustomErrors');

const ALLOWED_STATUSES = [
    'abierta',
    'cerrada',
    'reservada'
];

const validateDates = (startTime, endTime) => {
    if (new Date(startTime) >= new Date(endTime)) {
        throw new BusinessLogicError('La fecha de inicio debe ser anterior a la fecha de fin');
    }
};

const validateStatus = (status) => {
    if (status && !ALLOWED_STATUSES.includes(status)) {
        throw new BusinessLogicError(
            `El estado "${status}" no está permitido. ` +
            `Estados válidos: ${ALLOWED_STATUSES.join(', ')}`
        );
    }
};

const validateCapacity = (capacity) => {
    if (capacity !== undefined && capacity !== null) {
        const capacityNum = Number(capacity);
        if (isNaN(capacityNum) || capacityNum < 1) {
            throw new BusinessLogicError('La capacidad debe ser un número mayor o igual a 1');
        }
    }
};

const listSchedules = async ({ page, limit }) => {
    const { safePage, safeLimit, offset } = buildPaginationParams(page, limit);

    const { count, rows } = await scheduleRepository.findAndCountAll({
        where: {},
        offset,
        limit: safeLimit,
        order: [['startTime', 'ASC']],
    });

    return buildPaginationResponse(rows, count, safePage, safeLimit);
};

const getScheduleById = async (id) => {
    const schedule = await scheduleRepository.findById(id);

    if (!schedule) {
        throw new NotFoundError('Horario no encontrado');
    }

    return schedule;
};

const createSchedule = async (scheduleData) => {

    validateDates(scheduleData.startTime, scheduleData.endTime);
    validateStatus(scheduleData.status);
    validateCapacity(scheduleData.capacity);
   
    const payload = {
        ...scheduleData,
        status: scheduleData.status || 'abierta',
        capacity: scheduleData.capacity || 1
    };

    return scheduleRepository.create(payload);
};

const updateSchedule = async (id, updateData) => {
    const schedule = await getScheduleById(id);

    const startTime = updateData.startTime || schedule.startTime;
    const endTime = updateData.endTime || schedule.endTime;
    
    validateDates(startTime, endTime);
    validateStatus(updateData.status);
    validateCapacity(updateData.capacity);

    return scheduleRepository.update(schedule, updateData);
};

const deleteSchedule = async (id) => {
    const schedule = await getScheduleById(id);
    return scheduleRepository.deleteSchedule(schedule);
};

const getSchedulesByProfessional = async (professionalId) => {
    return scheduleRepository.findByProfessionalId(professionalId, { 
        status: 'abierta' 
    });
};

const getSchedulesByCareUnit = async (unitId) => {
    return scheduleRepository.findByUnitId(unitId, { 
        status: 'abierta' 
    });
};

const searchSchedulesByProfessionalName = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
        throw new BusinessLogicError('Debe proporcionar un término de búsqueda');
    }

    return scheduleRepository.findByProfessionalName(searchTerm.trim());
};

const searchSchedulesByCareUnitName = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
        throw new BusinessLogicError('Debe proporcionar un término de búsqueda');
    }

    return scheduleRepository.findByCareUnitName(searchTerm.trim());
};

module.exports = {
    listSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedulesByProfessional,
    getSchedulesByCareUnit,
    searchSchedulesByProfessionalName,
    searchSchedulesByCareUnitName,
};

