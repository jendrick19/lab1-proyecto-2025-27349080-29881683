const { Router } = require('express');
const operativeRoutes = require('./routes');
const { authenticate } = require('../platform/middlewares/authMiddleware');

const router = Router();

// Ruta pública de health check
router.get('/health', (req, res) => {
  res.json({
    module: 'operative-agenda',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Todas las demás rutas requieren autenticación
router.use(authenticate);
router.use('/', operativeRoutes);

module.exports = router;

