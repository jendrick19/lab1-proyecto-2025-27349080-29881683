const { Router } = require('express');
const insurerRoutes = require('./InsurerRoutes');
const planRoutes = require('./PlanRoutes');
const affiliationRoutes = require('./AffiliationRoutes');
const authorizationRoutes = require('./AuthorizationRoutes');
const serviceRoutes = require('./ServiceRoutes');
const tariffRoutes = require('./TariffRoutes');
const invoiceRoutes = require('./InvoiceRoutes');
const invoiceItemRoutes = require('./InvoiceItemRoutes');
const paymentRoutes = require('./PaymentRoutes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    module: 'bussines',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Rutas de aseguradoras: /api/bussines/aseguradoras
router.use('/aseguradoras', insurerRoutes);

// Rutas de planes: /api/bussines/planes
router.use('/planes', planRoutes);

// Rutas de afiliaciones: /api/bussines/afiliaciones
router.use('/afiliaciones', affiliationRoutes);

// Rutas de autorizaciones: /api/bussines/autorizaciones
router.use('/autorizaciones', authorizationRoutes);

// Rutas de prestaciones: /api/bussines/prestaciones
router.use('/prestaciones', serviceRoutes);

// Rutas de aranceles: /api/bussines/aranceles
router.use('/aranceles', tariffRoutes);

// Rutas de facturas: /api/bussines/facturas
router.use('/facturas', invoiceRoutes);

// Rutas de items de factura: /api/bussines/factura-items
router.use('/factura-items', invoiceItemRoutes);

// Rutas de pagos: /api/bussines/pagos
router.use('/pagos', paymentRoutes);

module.exports = router;
