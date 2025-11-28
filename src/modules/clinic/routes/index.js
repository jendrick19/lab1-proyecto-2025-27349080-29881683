const { Router } = require('express');
const episodeRoutes = require('./EpisodeRoutes');
const clinicalNoteRoutes = require('./ClinicalNoteRoutes');
const diagnosisRoutes = require('./DiagnosisRouter');
const consentRoutes = require('./ConsentRoutes');

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
router.use('/diagnosticos', diagnosisRoutes);
router.use('/consentimientos', consentRoutes);

module.exports = router;

