const { Router } = require('express');
const peopleRoutes = require('./people.routes');
const professionalRoutes = require('./professional.routes');
const careUnitRoutes = require('./careUnit.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    module: 'operative-agenda',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.use('/personas', peopleRoutes);
router.use('/profesionales', professionalRoutes);
router.use('/unid-atencion', careUnitRoutes);

module.exports = router;

