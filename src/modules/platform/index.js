const { Router } = require('express');
const accessRoutes = require('./routes');
const authRoutes = require('./routes/authRoutes');

const router = Router();

router.use('/access', accessRoutes);
router.use('/auth', authRoutes);

module.exports = router;

