const { Router } = require('express');
const peopleRoutes = require('./people.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    module: 'operative-agenda',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.use('/personas', peopleRoutes);

module.exports = router;

