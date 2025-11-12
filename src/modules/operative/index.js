const { Router } = require('express');
const agendaRoutes = require('./agenda/routes');

const router = Router();

router.use('/agenda', agendaRoutes);

module.exports = router;

