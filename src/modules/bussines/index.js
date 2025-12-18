const { Router } = require('express');
const billingRoutes = require('./routes');

const router = Router();

router.use('/billing', billingRoutes);

module.exports = router;
