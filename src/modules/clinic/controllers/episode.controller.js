const {
  listEpisodes,
  getEpisodeById,
  searchEpisodesByPatientName,
  searchEpisodesByPatientDocument,
  createEpisode,
  updateEpisode,
  closeEpisode,
} = require('../services/episode.service');

const mapModelToResponse = (episode) => {
  if (!episode) return null;

  return {
    id: episode.id,
    paciente: episode.peopleAttended
      ? {
          id: episode.peopleAttended.id,
          nombres: episode.peopleAttended.names,
          apellidos: episode.peopleAttended.surNames,
          tipoDocumento: episode.peopleAttended.documentType,
          numeroDocumento: episode.peopleAttended.documentId,
        }
      : undefined,
    fechaApertura: episode.openingDate,
    motivo: episode.reason,
    tipo: episode.type,
    estado: episode.status,
    notasClinicas: episode.clinicalNotes
      ? episode.clinicalNotes.map(note => ({
          id: note.id,
          titulo: note.title,
          contenido: note.content,
          createdAt: note.createdAt,
        }))
      : undefined,
    diagnosticos: episode.diagnosis
      ? episode.diagnosis.map(diag => ({
          id: diag.id,
          tipo: diag.type,
          descripcion: diag.description,
          codigoCIE10: diag.cie10Code,
          createdAt: diag.createdAt,
        }))
      : undefined,
    createdAt: episode.createdAt,
    updatedAt: episode.updatedAt,
  };
};

const mapRequestToModel = (body) => {
  const payload = {};

  if (body.pacienteId !== undefined) payload.peopleId = body.pacienteId;
  if (body.fechaApertura !== undefined) {
    const date = new Date(body.fechaApertura);
    if (!Number.isNaN(date.getTime())) {
      payload.openingDate = date;
    }
  }
  if (body.motivo !== undefined) payload.reason = body.motivo;
  if (body.tipo !== undefined) payload.type = body.tipo;
  if (body.estado !== undefined) payload.status = body.estado;

  return payload;
};

const listHandler = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'fecha',
      sortOrder = 'desc',
      nombrePaciente,
      documentoPaciente,
      paciente,
      estado,
      tipo,
      fechaDesde,
      fechaHasta,
    } = req.query;

    const result = await listEpisodes({
      page,
      limit,
      sortBy,
      sortOrder,
      filters: {
        nombrePaciente,
        documentoPaciente,
        paciente,
        estado,
        tipo,
        fechaDesde,
        fechaHasta,
      },
    });

    return res.json({
      codigo: 200,
      mensaje: 'Lista de episodios obtenida exitosamente',
      data: result.rows.map(mapModelToResponse),
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const getHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const episode = await getEpisodeById(id);

    return res.json({
      codigo: 200,
      mensaje: 'Episodio encontrado',
      data: mapModelToResponse(episode),
    });
  } catch (error) {
    return next(error);
  }
};

const searchByPersonHandler = async (req, res, next) => {
  try {
    const { nombre, tipoDocumento, numeroDocumento, page = 1, limit = 20, sortBy = 'fecha', sortOrder = 'desc' } = req.query;

    // Determinar tipo de búsqueda basado en los parámetros recibidos
    let result;

    if (nombre) {
      // Búsqueda por nombre
      result = await searchEpisodesByPatientName(nombre, {
        page,
        limit,
        sortBy,
        sortOrder,
      });
    } else if (tipoDocumento && numeroDocumento) {
      // Búsqueda por documento
      result = await searchEpisodesByPatientDocument(tipoDocumento, numeroDocumento, {
        page,
        limit,
        sortBy,
        sortOrder,
      });
    } else {
      return res.status(400).json({
        codigo: 400,
        mensaje: 'Debe proporcionar "nombre" o "tipoDocumento" y "numeroDocumento" para buscar',
      });
    }

    return res.json({
      codigo: 200,
      mensaje: 'Episodios encontrados',
      data: result.rows.map(mapModelToResponse),
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const createHandler = async (req, res, next) => {
  try {
    const payload = mapRequestToModel(req.body);
    const episode = await createEpisode(payload);

    return res.status(201).json({
      codigo: 201,
      mensaje: 'Episodio creado exitosamente',
      data: mapModelToResponse(episode),
    });
  } catch (error) {
    return next(error);
  }
};

const updateHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = mapRequestToModel(req.body);
    const updated = await updateEpisode(id, payload);

    return res.json({
      codigo: 200,
      mensaje: 'Episodio actualizado exitosamente',
      data: mapModelToResponse(updated),
    });
  } catch (error) {
    return next(error);
  }
};

const closeHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const closed = await closeEpisode(id);

    return res.json({
      codigo: 200,
      mensaje: 'Episodio cerrado exitosamente',
      data: mapModelToResponse(closed),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listHandler,
  getHandler,
  searchByPersonHandler,
  createHandler,
  updateHandler,
  closeHandler,
};