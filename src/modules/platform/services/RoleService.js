const { Role, Permission, RolePermission } = require('../../../../database/models');
const { Op } = require('sequelize');

class RoleService {
  /**
   * Listar todos los roles
   */
  async list() {
    try {
      const roles = await Role.findAll({
        include: [{
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
          attributes: ['id', 'clave', 'descripcion']
        }],
        order: [['nombre', 'ASC']]
      });

      return roles;
    } catch (error) {
      console.error('Error al listar roles:', error);
      throw error;
    }
  }

  /**
   * Obtener rol por ID
   */
  async findById(roleId) {
    try {
      const role = await Role.findByPk(roleId, {
        include: [{
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
          attributes: ['id', 'clave', 'descripcion']
        }]
      });

      if (!role) {
        throw new Error('Rol no encontrado');
      }

      return role;
    } catch (error) {
      console.error('Error al obtener rol:', error);
      throw error;
    }
  }

  /**
   * Listar todos los permisos disponibles
   */
  async listPermissions() {
    try {
      const permissions = await Permission.findAll({
        order: [['clave', 'ASC']]
      });

      return permissions;
    } catch (error) {
      console.error('Error al listar permisos:', error);
      throw error;
    }
  }

  /**
   * Asignar permisos a un rol
   */
  async assignPermissions(roleId, permissionKeys) {
    try {
      const role = await Role.findByPk(roleId);
      if (!role) {
        throw new Error('Rol no encontrado');
      }

      for (const permissionKey of permissionKeys) {
        const permission = await Permission.findOne({ 
          where: { clave: permissionKey } 
        });
        
        if (permission) {
          // Verificar si ya existe la asignación
          const existing = await RolePermission.findOne({
            where: { roleId, permissionId: permission.id }
          });
          
          if (!existing) {
            await RolePermission.create({
              roleId,
              permissionId: permission.id
            });
          }
        }
      }

      return await this.findById(roleId);
    } catch (error) {
      console.error('Error al asignar permisos:', error);
      throw error;
    }
  }

  /**
   * Remover permisos de un rol
   */
  async removePermissions(roleId, permissionKeys) {
    try {
      const permissions = await Permission.findAll({
        where: { clave: { [Op.in]: permissionKeys } }
      });

      const permissionIds = permissions.map(p => p.id);

      await RolePermission.destroy({
        where: {
          roleId,
          permissionId: { [Op.in]: permissionIds }
        }
      });

      return await this.findById(roleId);
    } catch (error) {
      console.error('Error al remover permisos:', error);
      throw error;
    }
  }
}

const roleServiceInstance = new RoleService();

module.exports = roleServiceInstance;

