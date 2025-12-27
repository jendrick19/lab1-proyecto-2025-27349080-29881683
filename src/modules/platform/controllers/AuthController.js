const AuthService = require('../services/AuthService');

/**
 * Login de usuario
 */
const loginHandler = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Se requiere username y password'
      });
    }

    const result = await AuthService.login(username, password);

    res.json({
      message: 'Login exitoso',
      data: result
    });
  } catch (error) {
    console.error('Error en login:', error);

    if (error.message === 'Usuario o contraseña incorrectos' || 
        error.message === 'Usuario inactivo') {
      return res.status(401).json({
        error: 'Error de autenticación',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al procesar login'
    });
  }
};

/**
 * Registro de nuevo usuario
 */
const registerHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Se requiere username y password'
      });
    }

    // Validación básica de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validación fallida',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const result = await AuthService.register({ username, email, password });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error en registro:', error);

    if (error.message === 'El usuario ya existe') {
      return res.status(409).json({
        error: 'Conflicto',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al registrar usuario'
    });
  }
};

/**
 * Refrescar access token usando refresh token
 */
const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Se requiere refreshToken'
      });
    }

    const result = await AuthService.refreshAccessToken(refreshToken);

    res.json({
      message: 'Token refrescado exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error al refrescar token:', error);

    if (error.message === 'Token expirado' || 
        error.message === 'Token inválido' ||
        error.message === 'Token de tipo incorrecto') {
      return res.status(401).json({
        error: 'No autorizado',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al refrescar token'
    });
  }
};

/**
 * Obtener información del usuario autenticado
 */
const getMeHandler = async (req, res) => {
  try {
    // El usuario viene del middleware de autenticación
    const user = req.user;

    res.json({
      message: 'Usuario obtenido exitosamente',
      data: user
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener información del usuario'
    });
  }
};

/**
 * Cambiar contraseña del usuario autenticado
 */
const changePasswordHandler = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Se requiere oldPassword y newPassword'
      });
    }

    // Validación básica de contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Validación fallida',
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    const userId = req.userId; // Del middleware de autenticación

    const result = await AuthService.changePassword(userId, oldPassword, newPassword);

    res.json({
      message: result.message
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);

    if (error.message === 'Contraseña actual incorrecta') {
      return res.status(401).json({
        error: 'Error de autenticación',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al cambiar contraseña'
    });
  }
};

/**
 * Logout (en implementaciones JWT stateless, el logout es del lado del cliente)
 * Este endpoint puede ser usado para invalidar tokens en el futuro (con blacklist)
 */
const logoutHandler = async (req, res) => {
  try {
    // Por ahora, simplemente confirmamos el logout
    // En una implementación más completa, aquí se podría agregar el token a una blacklist

    res.json({
      message: 'Logout exitoso'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al procesar logout'
    });
  }
};

module.exports = {
  loginHandler,
  registerHandler,
  refreshTokenHandler,
  getMeHandler,
  changePasswordHandler,
  logoutHandler
};

