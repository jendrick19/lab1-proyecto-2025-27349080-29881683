const { Router } = require('express');
const notificationRoutes = require('./NotificationRoutes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    module: 'platform-access',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.use('/notificaciones', notificationRoutes);

module.exports = router;
