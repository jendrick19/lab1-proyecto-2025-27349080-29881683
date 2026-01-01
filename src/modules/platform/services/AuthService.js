const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role, Permission, UserRole } = require('../../../../database/models');

class AuthService {
  constructor() {
    // Configuración de JWT desde variables de entorno
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  /**
   * Login de usuario - genera access token y refresh token
   */
  async login(username, password) {
    try {
      // Buscar usuario por username o email con sus roles y permisos
      const user = await User.findOne({
        where: {
          username: username
        },
        include: [{
          model: Role,
          as: 'roles',
          through: { attributes: [] }, // No incluir atributos de la tabla intermedia
          include: [{
            model: Permission,
            as: 'permissions',
            through: { attributes: [] }
          }]
        }]
      });

      if (!user) {
        throw new Error('Usuario o contraseña incorrectos');
      }

      // Verificar que el usuario esté activo
      if (!user.status) {
        throw new Error('Usuario inactivo');
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      
      if (!isValidPassword) {
        throw new Error('Usuario o contraseña incorrectos');
      }

      // Obtener roles y permisos para el token
      const roles = user.roles ? user.roles.map(r => r.nombre) : [];
      const permissions = this.extractPermissions(user.roles);

      // Generar tokens
      const accessToken = this.generateAccessToken(user, roles, permissions);
      const refreshToken = this.generateRefreshToken(user, roles);

      // Retornar datos del usuario (sin el hash de contraseña) y tokens
      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          status: user.status,
          createdAt: user.createdAt,
          roles: roles,
          permissions: permissions
        },
        accessToken,
        refreshToken,
        expiresIn: this.jwtExpiresIn
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Extraer permisos únicos de los roles
   */
  extractPermissions(roles) {
    if (!roles || !Array.isArray(roles)) return [];
    
    const permissionsSet = new Set();
    roles.forEach(role => {
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach(permission => {
          permissionsSet.add(permission.clave);
        });
      }
    });
    
    return Array.from(permissionsSet);
  }

  /**
   * Generar access token (corta duración)
   */
  generateAccessToken(user, roles = [], permissions = []) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: roles,
      permissions: permissions,
      type: 'access'
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    });
  }

  /**
   * Generar refresh token (larga duración)
   */
  generateRefreshToken(user, roles = []) {
    const payload = {
      id: user.id,
      username: user.username,
      roles: roles,
      type: 'refresh'
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtRefreshExpiresIn
    });
  }

  /**
   * Verificar y decodificar token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      }
      throw error;
    }
  }

  /**
   * Refrescar access token usando refresh token
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Verificar refresh token
      const decoded = await this.verifyToken(refreshToken);

      if (decoded.type !== 'refresh') {
        throw new Error('Token de tipo incorrecto');
      }

      // Buscar usuario con roles y permisos
      const user = await User.findByPk(decoded.id, {
        include: [{
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          include: [{
            model: Permission,
            as: 'permissions',
            through: { attributes: [] }
          }]
        }]
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!user.status) {
        throw new Error('Usuario inactivo');
      }

      // Obtener roles y permisos
      const roles = user.roles ? user.roles.map(r => r.nombre) : [];
      const permissions = this.extractPermissions(user.roles);

      // Generar nuevo access token
      const accessToken = this.generateAccessToken(user, roles, permissions);

      return {
        accessToken,
        expiresIn: this.jwtExpiresIn
      };
    } catch (error) {
      console.error('Error al refrescar token:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo usuario (registro)
   * @param {Object} userData - Datos del usuario { username, email, password, roles: ['profesional'] }
   */
  async register(userData) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({
        where: {
          username: userData.username
        }
      });

      if (existingUser) {
        throw new Error('El usuario ya existe');
      }

      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Crear usuario
      const user = await User.create({
        username: userData.username,
        email: userData.email,
        passwordHash: passwordHash,
        status: true,
        creationDate: new Date()
      });

      // Asignar roles si se proporcionaron
      let assignedRoles = [];
      if (userData.roles && Array.isArray(userData.roles) && userData.roles.length > 0) {
        for (const roleName of userData.roles) {
          const role = await Role.findOne({ where: { nombre: roleName } });
          if (role) {
            await UserRole.create({
              userId: user.id,
              roleId: role.id
            });
            assignedRoles.push(roleName);
          }
        }
      }

      // Obtener usuario con roles y permisos
      const userWithRoles = await User.findByPk(user.id, {
        include: [{
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          include: [{
            model: Permission,
            as: 'permissions',
            through: { attributes: [] }
          }]
        }]
      });

      // Extraer roles y permisos
      const roles = userWithRoles.roles ? userWithRoles.roles.map(r => r.nombre) : [];
      const permissions = this.extractPermissions(userWithRoles.roles);

      // Generar tokens
      const accessToken = this.generateAccessToken(userWithRoles, roles, permissions);
      const refreshToken = this.generateRefreshToken(userWithRoles, roles);

      return {
        user: {
          id: userWithRoles.id,
          username: userWithRoles.username,
          email: userWithRoles.email,
          status: userWithRoles.status,
          createdAt: userWithRoles.createdAt,
          roles: roles,
          permissions: permissions
        },
        accessToken,
        refreshToken,
        expiresIn: this.jwtExpiresIn
      };
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
      
      if (!isValidPassword) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Hash de la nueva contraseña
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña
      await user.update({
        passwordHash: newPasswordHash
      });

      return {
        message: 'Contraseña actualizada exitosamente'
      };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por ID con roles y permisos
   */
  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'email', 'status', 'createdAt', 'updatedAt'],
        include: [{
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'descripcion'],
          include: [{
            model: Permission,
            as: 'permissions',
            through: { attributes: [] },
            attributes: ['id', 'clave', 'descripcion']
          }]
        }]
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }
}

const authServiceInstance = new AuthService();

module.exports = authServiceInstance;

