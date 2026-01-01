const { Router } = require('express');
const {
  loginHandler,
  registerHandler,
  refreshTokenHandler,
  getMeHandler,
  changePasswordHandler,
  logoutHandler
} = require('../controllers/AuthController');
const { authenticate } = require('../../../shared/middlewares/authMiddleware');

const router = Router();

// Rutas públicas (no requieren autenticación)
router.post('/login', loginHandler);
router.post('/register', registerHandler);
router.post('/refresh', refreshTokenHandler);

// Rutas protegidas (requieren autenticación)
router.get('/me', authenticate, getMeHandler);
router.post('/change-password', authenticate, changePasswordHandler);
router.post('/logout', authenticate, logoutHandler);

module.exports = router;

