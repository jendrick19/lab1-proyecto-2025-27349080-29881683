const UserService = require('../services/UserService');

/**
 * Listar usuarios
 */
const listHandler = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search
    };

    const users = await UserService.list(filters);

    res.json({
      message: 'Usuarios obtenidos exitosamente',
      data: users
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener usuarios'
    });
  }
};

/**
 * Obtener usuario por ID
 */
const getHandler = async (req, res) => {
  try {
    const user = await UserService.findById(req.params.id);

    res.json({
      message: 'Usuario obtenido exitosamente',
      data: user
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({
        error: 'No encontrado',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener usuario'
    });
  }
};

/**
 * Crear usuario
 */
const createHandler = async (req, res) => {
  try {
    const { username, email, password, roles, status } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Se requiere username, email y password'
      });
    }

    const user = await UserService.create({
      username,
      email,
      password,
      roles: roles || [],
      status
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      data: user
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);

    if (error.message === 'El usuario ya existe') {
      return res.status(409).json({
        error: 'Conflicto',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al crear usuario'
    });
  }
};

/**
 * Actualizar usuario
 */
const updateHandler = async (req, res) => {
  try {
    const { email, password, roles, status } = req.body;

    const user = await UserService.update(req.params.id, {
      email,
      password,
      roles,
      status
    });

    res.json({
      message: 'Usuario actualizado exitosamente',
      data: user
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);

    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({
        error: 'No encontrado',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al actualizar usuario'
    });
  }
};

/**
 * Eliminar usuario
 */
const deleteHandler = async (req, res) => {
  try {
    const result = await UserService.delete(req.params.id);

    res.json(result);
  } catch (error) {
    console.error('Error al eliminar usuario:', error);

    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({
        error: 'No encontrado',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al eliminar usuario'
    });
  }
};

/**
 * Asignar roles a un usuario
 */
const assignRolesHandler = async (req, res) => {
  try {
    const { roles } = req.body;

    if (!roles || !Array.isArray(roles)) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Se requiere un array de roles'
      });
    }

    await UserService.assignRoles(req.params.id, roles);
    const user = await UserService.findById(req.params.id);

    res.json({
      message: 'Roles asignados exitosamente',
      data: user
    });
  } catch (error) {
    console.error('Error al asignar roles:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al asignar roles'
    });
  }
};

/**
 * Remover roles de un usuario
 */
const removeRolesHandler = async (req, res) => {
  try {
    const { roles } = req.body;

    if (!roles || !Array.isArray(roles)) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Se requiere un array de roles'
      });
    }

    await UserService.removeRoles(req.params.id, roles);
    const user = await UserService.findById(req.params.id);

    res.json({
      message: 'Roles removidos exitosamente',
      data: user
    });
  } catch (error) {
    console.error('Error al remover roles:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al remover roles'
    });
  }
};

module.exports = {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler,
  assignRolesHandler,
  removeRolesHandler
};

