const authService = require('../services/AuthService');

const loginHandler = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const result = await authService.login(username, password);

    return res.json({
      codigo: 200,
      mensaje: 'Inicio de sesión exitoso',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        tokenType: result.tokenType,
        user: result.user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const registerHandler = async (req, res, next) => {
  try {
    const { username, email, password, status } = req.body;

    const newUser = await authService.register({
      username,
      email,
      password,
      status,
    });

    return res.status(201).json({
      codigo: 201,
      mensaje: 'Usuario registrado exitosamente',
      data: newUser,
    });
  } catch (error) {
    return next(error);
  }
};

const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        codigo: 400,
        mensaje: 'Refresh token es requerido',
        tipo: 'ValidationError',
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    return res.json({
      codigo: 200,
      mensaje: 'Token renovado exitosamente',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const logoutHandler = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await authService.logout(userId);

    return res.json({
      codigo: 200,
      mensaje: 'Sesión cerrada exitosamente',
    });
  } catch (error) {
    return next(error);
  }
};

const getCurrentUserHandler = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await authService.getCurrentUser(userId);

    return res.json({
      codigo: 200,
      mensaje: 'Usuario obtenido exitosamente',
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  loginHandler,
  registerHandler,
  refreshTokenHandler,
  logoutHandler,
  getCurrentUserHandler,
};

