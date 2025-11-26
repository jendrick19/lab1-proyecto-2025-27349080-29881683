const {
  listConsents,
  getConsentById,
  getConsentsByPeopleDocument,
  countConsentsByPeopleDocument,
  createConsent,
  updateConsent,
  deleteConsent,
} = require('../services/ConsentService');

const mapModelToResponse = (consent) => {
  if (!consent) return null;

  return {
    id: consent.id,
    persona: consent.peopleAttended
      ? {
          id: consent.peopleAttended.id,
          nombres: consent.peopleAttended.names,
          apellidos: consent.peopleAttended.surNames,
          tipoDocumento: consent.peopleAttended.documentType,
          numeroDocumento: consent.peopleAttended.documentId,
        }
      : undefined,
    tipoProcedimiento: consent.procedureType,
    fechaConsentimiento: consent.consentDate,
    metodo: consent.method,
    archivoId: consent.fileId,
    createdAt: consent.createdAt,
    updatedAt: consent.updatedAt,
  };
};

const mapRequestToModel = (body) => {
  const payload = {};

  if (body.personaId !== undefined) payload.peopleId = body.personaId;
  if (body.tipoProcedimiento !== undefined) payload.procedureType = body.tipoProcedimiento;
  if (body.metodo !== undefined) payload.method = body.metodo;
  if (body.archivoId !== undefined) payload.fileId = body.archivoId;
  if (body.fechaConsentimiento !== undefined) {
    const date = new Date(body.fechaConsentimiento);
    if (!Number.isNaN(date.getTime())) {
      payload.consentDate = date;
    }
  }

  return payload;
};

const listHandler = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'fecha',
      sortOrder = 'desc',
      persona,
      documento,
      procedimiento,
      metodo,
      fechaDesde,
      fechaHasta,
    } = req.query;

    const result = await listConsents({
      page,
      limit,
      sortBy,
      sortOrder,
      filters: {
        persona,
        documento,
        procedimiento,
        metodo,
        fechaDesde,
        fechaHasta,
      },
    });

    return res.json({
      codigo: 200,
      mensaje: 'Lista de consentimientos obtenida exitosamente',
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
    const consent = await getConsentById(id);

    return res.json({
      codigo: 200,
      mensaje: 'Consentimiento encontrado',
      data: mapModelToResponse(consent),
    });
  } catch (error) {
    return next(error);
  }
};

const getByPeopleDocumentHandler = async (req, res, next) => {
  try {
    const { documento } = req.query;
    const {
      page = 1,
      limit = 20,
      sortBy = 'fecha',
      sortOrder = 'desc',
    } = req.query;

    const result = await getConsentsByPeopleDocument(documento, {
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return res.json({
      codigo: 200,
      mensaje: 'Consentimientos por documento de persona obtenidos exitosamente',
      data: result.rows.map(mapModelToResponse),
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const countByPeopleDocumentHandler = async (req, res, next) => {
  try {
    const { documento } = req.query;
    const count = await countConsentsByPeopleDocument(documento);

    return res.json({
      codigo: 200,
      mensaje: 'Conteo de consentimientos por documento obtenido exitosamente',
      data: {
        documento,
        total: count,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const createHandler = async (req, res, next) => {
  try {
    const payload = mapRequestToModel(req.body);
    const consent = await createConsent(payload);

    return res.status(201).json({
      codigo: 201,
      mensaje: 'Consentimiento creado exitosamente',
      data: mapModelToResponse(consent),
    });
  } catch (error) {
    return next(error);
  }
};

const updateHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = mapRequestToModel(req.body);
    const updated = await updateConsent(id, payload);

    return res.json({
      codigo: 200,
      mensaje: 'Consentimiento actualizado exitosamente',
      data: mapModelToResponse(updated),
    });
  } catch (error) {
    return next(error);
  }
};

const deleteHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteConsent(id);

    return res.json({
      codigo: 200,
      mensaje: 'Consentimiento eliminado exitosamente',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listHandler,
  getHandler,
  getByPeopleDocumentHandler,
  countByPeopleDocumentHandler,
  createHandler,
  updateHandler,
  deleteHandler,
};

