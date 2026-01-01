const { Router } = require('express');
const notificationRoutes = require('./NotificationRoutes');
const authRoutes = require('./AuthRoutes');
const userRoutes = require('./UserRoutes');
const roleRoutes = require('./RoleRoutes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    module: 'platform-access',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/notificaciones', notificationRoutes);

module.exports = router;
