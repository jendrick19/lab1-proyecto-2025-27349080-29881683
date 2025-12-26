const { Router } = require('express');

const {
  listHandler,
  getHandler,
  createHandler,
  sendHandler,
  resendHandler,
  statisticsHandler,
  retryQueueHandler
} = require('../controllers/NotificationController');

const {
  validateCreate,
  validateList,
  validateStatistics,
  validateId
} = require('../validators/NotificationValidator');

const router = Router();

router.get('/', validateList, listHandler);

router.post('/', validateCreate, createHandler);

router.get('/estadisticas', validateStatistics, statisticsHandler);

router.post('/procesar-reintentos', retryQueueHandler);

router.get('/:id', validateId, getHandler);

router.post('/:id/enviar', validateId, sendHandler);

router.post('/:id/reenviar', validateId, resendHandler);

module.exports = router;

