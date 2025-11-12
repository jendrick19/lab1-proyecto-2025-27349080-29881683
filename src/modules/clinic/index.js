const { Router } = require('express');
const casesRoutes = require('./cases/routes');

const router = Router();

router.use('/cases', casesRoutes);

module.exports = router;

