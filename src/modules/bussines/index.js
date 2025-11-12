const { Router } = require('express');
const billingRoutes = require('./billing/routes');

const router = Router();

router.use('/billing', billingRoutes);

module.exports = router;

