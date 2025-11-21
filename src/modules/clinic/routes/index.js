const { Router } = require('express');
const episodeRoutes = require('./episode.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    module: 'clinic-cases',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.use('/episodios', episodeRoutes);

module.exports = router;

