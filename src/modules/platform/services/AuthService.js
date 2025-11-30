const userRepository = require('../repositories/UserRepository');
const userRoleRepository = require('../repositories/UserRoleRepository');
const { hashPassword, comparePassword } = require('../../../shared/utils/passwordHelper');
const tokenService = require('./TokenService');
const { NotFoundError, BusinessLogicError, UnauthorizedError } = require('../../../shared/errors/CustomErrors');

/**
 * Valida las credenciales de un usuario
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<object>} - Usuario si las credenciales son válidas
 * @throws {UnauthorizedError} - Si las credenciales son inválidas
 */
const validateCredentials = async (username, password) => {
  const user = await userRepository.findByUsername(username);

  if (!user) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  if (!user.status) {
    throw new UnauthorizedError('Usuario inactivo');
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  return user;
};

/**
 * Obtiene los roles de un usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array<string>>} - Array de nombres de roles
 */
const getUserRoles = async (userId) => {
  const userRoles = await userRoleRepository.findByUserId(userId, true);

  return userRoles
    .filter(userRole => userRole.role) // Filtrar roles que existan
    .map(userRole => userRole.role.name);
};

/**
 * Autentica un usuario y genera tokens
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise<object>} - Tokens y información del usuario
 */
const login = async (username, password) => {
  const user = await validateCredentials(username, password);

  const roles = await getUserRoles(user.id);

  const accessToken = tokenService.generateAccessToken(
    user.id,
    user.username,
    roles
  );

  const refreshToken = tokenService.generateRefreshToken(user.id);

  await userRepository.updateRefreshToken(user, refreshToken);

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600, // 1 hora en segundos
    tokenType: 'Bearer',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      roles,
    },
  };
};

/**
 * Registra un nuevo usuario
 * @param {object} userData - Datos del usuario
 * @returns {Promise<object>} - Usuario creado
 */
const register = async (userData) => {
  const existingUser = await userRepository.findByUsername(userData.username);

  if (existingUser) {
    throw new BusinessLogicError('El nombre de usuario ya está en uso');
  }

  const existingEmail = await userRepository.findByEmail(userData.email);

  if (existingEmail) {
    throw new BusinessLogicError('El correo electrónico ya está en uso');
  }

  const passwordHash = await hashPassword(userData.password);

  const newUser = await userRepository.create({
    username: userData.username,
    email: userData.email,
    passwordHash,
    status: userData.status !== undefined ? userData.status : true,
    creationDate: new Date(),
  });

  return {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    status: newUser.status,
  };
};

/**
 * Genera un nuevo access token usando un refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<object>} - Nuevo access token
 */
const refreshAccessToken = async (refreshToken) => {
  let decoded;

  try {
    decoded = tokenService.verifyToken(refreshToken);
  } catch (error) {
    throw new UnauthorizedError('Refresh token inválido o expirado');
  }

  if (decoded.type !== 'refresh') {
    throw new UnauthorizedError('Token no es un refresh token válido');
  }

  const user = await userRepository.findByRefreshToken(refreshToken);

  if (!user) {
    throw new UnauthorizedError('Refresh token no encontrado');
  }

  if (!user.status) {
    throw new UnauthorizedError('Usuario inactivo');
  }

  const roles = await getUserRoles(user.id);

  const newAccessToken = tokenService.generateAccessToken(
    user.id,
    user.username,
    roles
  );

  return {
    accessToken: newAccessToken,
    expiresIn: 3600,
    tokenType: 'Bearer',
  };
};

/**
 * Cierra sesión de un usuario (invalida refresh token)
 * @param {number} userId - ID del usuario
 */
const logout = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  await userRepository.clearRefreshToken(user);
};

/**
 * Obtiene información del usuario actual
 * @param {number} userId - ID del usuario
 * @returns {Promise<object>} - Información del usuario con roles
 */
const getCurrentUser = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  const roles = await getUserRoles(userId);

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    status: user.status,
    roles,
    lastLogin: user.lastLogin,
    creationDate: user.creationDate,
  };
};

module.exports = {
  login,
  register,
  refreshAccessToken,
  logout,
  getCurrentUser,
  validateCredentials,
  getUserRoles,
};

