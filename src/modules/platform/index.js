const { Router } = require('express');
const platformRoutes = require('./routes');
const router = Router();
router.use('/', platformRoutes);
module.exports = router;
