const {
    listSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedulesByProfessional,
    getSchedulesByCareUnit,
    searchSchedulesByProfessionalName,
    searchSchedulesByCareUnitName,
} = require('../services/schedule.service');

const mapModelToResponse = (schedule) => {
    if (!schedule) {
        return null;
    }

    const response = {
        id: schedule.id,
        profesionalId: schedule.professionalId,
        unidadId: schedule.unitId,
        fechaInicio: schedule.startTime,
        fechaFin: schedule.endTime,
        capacidad: schedule.capacity,
        estado: schedule.status,
    };

    if (schedule.professional) {
        response.profesional = {
            id: schedule.professional.id,
            nombres: schedule.professional.names,
            apellidos: schedule.professional.surNames,
            especialidad: schedule.professional.specialty,
        };
    }

    if (schedule.careUnit) {
        response.unidad = {
            id: schedule.careUnit.id,
            nombre: schedule.careUnit.name,
            direccion: schedule.careUnit.address,
        };
    }

    return response;
};

const mapRequestToModel = (body) => {
    const payload = {};

    if (body.profesionalId !== undefined) payload.professionalId = Number(body.profesionalId);
    if (body.unidadId !== undefined) payload.unitId = Number(body.unidadId);
    if (body.fechaInicio !== undefined) payload.startTime = body.fechaInicio;
    if (body.fechaFin !== undefined) payload.endTime = body.fechaFin;
    if (body.capacidad !== undefined) payload.capacity = Number(body.capacidad);
    if (body.estado !== undefined) payload.status = body.estado;

    return payload;
};

const listHandler = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
        } = req.query;

        const result = await listSchedules({
            page,
            limit,
        });

        res.json({
            codigo: 200,
            mensaje: 'Lista de agendas obtenidas exitosamente',
            data: result.rows.map(mapModelToResponse),
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
};

const getHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const schedule = await getScheduleById(id);

        return res.json({
            codigo: 200,
            mensaje: 'Agenda encontrada',
            data: mapModelToResponse(schedule),
        });
    } catch (error) {
        return next(error);
    }
};

const createHandler = async (req, res, next) => {
    try {
        const payload = mapRequestToModel(req.body);

        const schedule = await createSchedule(payload);

        return res.status(201).json({
            codigo: 201,
            mensaje: 'Agenda creada exitosamente',
            data: mapModelToResponse(schedule),
        });
    } catch (error) {
        return next(error);
    }
};

const updateHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payload = mapRequestToModel(req.body);

        const updated = await updateSchedule(id, payload);

        return res.json({
            codigo: 200,
            mensaje: 'Agenda actualizada exitosamente',
            data: mapModelToResponse(updated),
        });
    } catch (error) {
        return next(error);
    }
};

const deleteHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteSchedule(id);

        return res.status(200).json({
            codigo: 200,
            mensaje: 'Agenda eliminada exitosamente',
        });
    } catch (error) {
        return next(error);
    }
};

const getByProfessionalHandler = async (req, res, next) => {
    try {
        const { professionalId } = req.params;
        const schedules = await getSchedulesByProfessional(professionalId);

        return res.json({
            codigo: 200,
            mensaje: 'Agendas del profesional obtenidas exitosamente',
            data: schedules.map(mapModelToResponse),
        });
    } catch (error) {
        return next(error);
    }
};

const getByCareUnitHandler = async (req, res, next) => {
    try {
        const { unitId } = req.params;
        const schedules = await getSchedulesByCareUnit(unitId);

        return res.json({
            codigo: 200,
            mensaje: 'Agendas de la unidad obtenidas exitosamente',
            data: schedules.map(mapModelToResponse),
        });
    } catch (error) {
        return next(error);
    }
};

const searchByProfessionalNameHandler = async (req, res, next) => {
    try {
        const { nombre, id } = req.query;
        let schedules;

        if (id) {
            // Buscar por ID de profesional
            schedules = await getSchedulesByProfessional(id);
        } else {
            // Buscar por nombre
            schedules = await searchSchedulesByProfessionalName(nombre);
        }

        return res.json({
            codigo: 200,
            mensaje: id ? 'Agendas del profesional obtenidas exitosamente' : 'Agendas encontradas por nombre de profesional',
            data: schedules.map(mapModelToResponse),
        });
    } catch (error) {
        return next(error);
    }
};

const searchByCareUnitNameHandler = async (req, res, next) => {
    try {
        const { nombre, id } = req.query;
        let schedules;

        if (id) {
            // Buscar por ID de unidad
            schedules = await getSchedulesByCareUnit(id);
        } else {
            // Buscar por nombre
            schedules = await searchSchedulesByCareUnitName(nombre);
        }

        return res.json({
            codigo: 200,
            mensaje: id ? 'Agendas de la unidad obtenidas exitosamente' : 'Agendas encontradas por nombre de la unidad',
            data: schedules.map(mapModelToResponse),
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    listHandler,
    getHandler,
    createHandler,
    updateHandler,
    deleteHandler,
    getByProfessionalHandler,
    getByCareUnitHandler,
    searchByProfessionalNameHandler,
    searchByCareUnitNameHandler,
};

