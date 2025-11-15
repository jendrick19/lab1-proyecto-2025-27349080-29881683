const { Router } = require('express');
const casesRoutes = require('./routes');

const router = Router();

router.use('/cases', casesRoutes);

module.exports = router;

