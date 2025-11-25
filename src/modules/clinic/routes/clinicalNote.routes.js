const { Router } = require('express');
const {
  listHandler,
  getHandler,
  getByEpisodeHandler,
  getByProfessionalHandler,
  getByDateRangeHandler,
  createHandler,
  updateHandler,
  getVersionHistoryHandler,
  getVersionHandler,
  getLatestVersionHandler,
  compareVersionsHandler,
} = require('../controllers/ClinicalNoteController');
const {
  validateCreate,
  validateUpdate,
  validateId,
  validateEpisodeId,
  validateProfessionalId,
  validateList,
  validateDateRange,
  validateVersionId,
  validateCompareVersions,
} = require('../validators/ClinicalNoteValidator');

const router = Router();

router.get('/rango-fechas', validateDateRange, getByDateRangeHandler);
router.get('/episodio/:episodeId', validateEpisodeId, getByEpisodeHandler);
router.get('/profesional/:professionalId', validateProfessionalId, getByProfessionalHandler);

router.get('/', validateList, listHandler);
router.post('/', validateCreate, createHandler);
router.get('/:id', validateId, getHandler);
router.patch('/:id', validateUpdate, updateHandler);

router.get('/:id/versiones', validateId, getVersionHistoryHandler);
router.get('/:id/version-actual', validateId, getLatestVersionHandler);
router.get('/:id/comparar', validateCompareVersions, compareVersionsHandler);

router.get('/version/:versionId', validateVersionId, getVersionHandler);

module.exports = router;

