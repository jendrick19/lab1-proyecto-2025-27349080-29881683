const { Router } = require('express');
const AuthController = require('../controllers/AuthController');
const { validateLogin, validateRegister, validateRefreshToken } = require('../validators/AuthValidator');
const { authenticate } = require('../middlewares/authMiddleware');

const router = Router();

// Ruta pública: Login
router.post('/login', validateLogin, AuthController.loginHandler);

// Ruta pública: Registro
router.post('/register', validateRegister, AuthController.registerHandler);

// Ruta pública: Refresh token
router.post('/refresh', validateRefreshToken, AuthController.refreshTokenHandler);

// Rutas protegidas (requieren autenticación)
router.get('/me', authenticate, AuthController.getCurrentUserHandler);
router.post('/logout', authenticate, AuthController.logoutHandler);

module.exports = router;

