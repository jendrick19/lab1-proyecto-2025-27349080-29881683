const { Router } = require('express');

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    module: 'clinic-cases',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

