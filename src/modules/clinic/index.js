const { Router } = require('express');
const casesRoutes = require('./routes');
const { authenticate } = require('../platform/middlewares/authMiddleware');

const router = Router();

// Ruta pública de health check
router.get('/health', (req, res) => {
  res.json({
    module: 'clinic-cases',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Todas las demás rutas requieren autenticación
router.use(authenticate);
router.use('/', casesRoutes);

module.exports = router;

