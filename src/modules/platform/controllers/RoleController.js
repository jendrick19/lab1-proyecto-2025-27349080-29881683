const RoleService = require('../services/RoleService');

/**
 * Listar roles
 */
const listRolesHandler = async (req, res) => {
  try {
    const roles = await RoleService.list();

    res.json({
      message: 'Roles obtenidos exitosamente',
      data: roles
    });
  } catch (error) {
    console.error('Error al listar roles:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener roles'
    });
  }
};

/**
 * Obtener rol por ID
 */
const getRoleHandler = async (req, res) => {
  try {
    const role = await RoleService.findById(req.params.id);

    res.json({
      message: 'Rol obtenido exitosamente',
      data: role
    });
  } catch (error) {
    console.error('Error al obtener rol:', error);
    
    if (error.message === 'Rol no encontrado') {
      return res.status(404).json({
        error: 'No encontrado',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener rol'
    });
  }
};

/**
 * Listar permisos disponibles
 */
const listPermissionsHandler = async (req, res) => {
  try {
    const permissions = await RoleService.listPermissions();

    res.json({
      message: 'Permisos obtenidos exitosamente',
      data: permissions
    });
  } catch (error) {
    console.error('Error al listar permisos:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener permisos'
    });
  }
};

/**
 * Asignar permisos a un rol
 */
const assignPermissionsHandler = async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Se requiere un array de claves de permisos'
      });
    }

    const role = await RoleService.assignPermissions(req.params.id, permissions);

    res.json({
      message: 'Permisos asignados exitosamente',
      data: role
    });
  } catch (error) {
    console.error('Error al asignar permisos:', error);
    
    if (error.message === 'Rol no encontrado') {
      return res.status(404).json({
        error: 'No encontrado',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al asignar permisos'
    });
  }
};

/**
 * Remover permisos de un rol
 */
const removePermissionsHandler = async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Se requiere un array de claves de permisos'
      });
    }

    const role = await RoleService.removePermissions(req.params.id, permissions);

    res.json({
      message: 'Permisos removidos exitosamente',
      data: role
    });
  } catch (error) {
    console.error('Error al remover permisos:', error);
    
    if (error.message === 'Rol no encontrado') {
      return res.status(404).json({
        error: 'No encontrado',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al remover permisos'
    });
  }
};

module.exports = {
  listRolesHandler,
  getRoleHandler,
  listPermissionsHandler,
  assignPermissionsHandler,
  removePermissionsHandler
};

