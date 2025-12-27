const bcrypt = require('bcryptjs');
const { User, Role, Permission, UserRole } = require('../../../../database/models');
const { Op } = require('sequelize');

class UserService {
  /**
   * Listar usuarios con filtros
   */
  async list(filters = {}) {
    try {
      const where = {};
      
      if (filters.status !== undefined) {
        where.status = filters.status;
      }
      
      if (filters.search) {
        where[Op.or] = [
          { username: { [Op.like]: `%${filters.search}%` } },
          { email: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const users = await User.findAll({
        where,
        attributes: ['id', 'username', 'email', 'status', 'createdAt', 'updatedAt'],
        include: [{
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'descripcion']
        }],
        order: [['createdAt', 'DESC']]
      });

      return users;
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   */
  async findById(userId) {
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

  /**
   * Crear usuario con roles
   */
  async create(userData) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({
        where: { username: userData.username }
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
        status: userData.status !== undefined ? userData.status : true,
        creationDate: new Date()
      });

      // Asignar roles si se proporcionaron
      if (userData.roles && Array.isArray(userData.roles)) {
        await this.assignRoles(user.id, userData.roles);
      }

      // Obtener usuario con roles
      return await this.findById(user.id);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Actualizar usuario
   */
  async update(userId, userData) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Actualizar datos básicos
      const updateData = {};
      if (userData.email) updateData.email = userData.email;
      if (userData.status !== undefined) updateData.status = userData.status;
      if (userData.password) {
        updateData.passwordHash = await bcrypt.hash(userData.password, 10);
      }

      await user.update(updateData);

      // Actualizar roles si se proporcionaron
      if (userData.roles && Array.isArray(userData.roles)) {
        // Eliminar roles existentes
        await UserRole.destroy({ where: { userId } });
        // Asignar nuevos roles
        await this.assignRoles(userId, userData.roles);
      }

      // Retornar usuario actualizado
      return await this.findById(userId);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  /**
   * Eliminar usuario
   */
  async delete(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Eliminar relaciones y usuario
      await UserRole.destroy({ where: { userId } });
      await user.destroy();

      return { message: 'Usuario eliminado exitosamente' };
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  /**
   * Asignar roles a un usuario
   */
  async assignRoles(userId, roleNames) {
    try {
      for (const roleName of roleNames) {
        const role = await Role.findOne({ where: { nombre: roleName } });
        if (role) {
          // Verificar si ya existe la asignación
          const existing = await UserRole.findOne({
            where: { userId, roleId: role.id }
          });
          
          if (!existing) {
            await UserRole.create({
              userId,
              roleId: role.id
            });
          }
        }
      }
    } catch (error) {
      console.error('Error al asignar roles:', error);
      throw error;
    }
  }

  /**
   * Remover roles de un usuario
   */
  async removeRoles(userId, roleNames) {
    try {
      const roles = await Role.findAll({
        where: { nombre: { [Op.in]: roleNames } }
      });

      const roleIds = roles.map(r => r.id);

      await UserRole.destroy({
        where: {
          userId,
          roleId: { [Op.in]: roleIds }
        }
      });
    } catch (error) {
      console.error('Error al remover roles:', error);
      throw error;
    }
  }
}

const userServiceInstance = new UserService();

module.exports = userServiceInstance;

