const { Router } = require('express');
const episodeRoutes = require('./episode.routes');
const clinicalNoteRoutes = require('./clinicalNote.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    module: 'clinic-cases',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.use('/episodios', episodeRoutes);
router.use('/notas-clinicas', clinicalNoteRoutes);

module.exports = router;

