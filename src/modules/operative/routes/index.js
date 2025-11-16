const { Router } = require('express');
const peopleRoutes = require('./people.routes');
const professionalRoutes = require('./professional.routes');

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

module.exports = router;

