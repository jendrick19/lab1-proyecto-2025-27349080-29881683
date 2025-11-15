const { Router } = require('express');
const agendaRoutes = require('./routes');

const router = Router();

router.use('/agenda', agendaRoutes);

module.exports = router;

