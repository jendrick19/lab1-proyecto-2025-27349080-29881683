const { Router } = require('express');

const {
    listHandler,
    getHandler,
    createHandler,
    updateHandler,
    deleteHandler,
    searchByProfessionalNameHandler,
    searchByCareUnitNameHandler,
} = require('../controllers/schedule.controller');

const {
    validateCreate,
    validateUpdate,
    validateId,
    validateList,
    validateSearchByName,
} = require('../validators/schedule.validator');

const router = Router();

// Rutas de búsqueda (deben ir ANTES de las rutas con :id para evitar conflictos)
router.get('/profesional', validateSearchByName, searchByProfessionalNameHandler);
router.get('/unidad', validateSearchByName, searchByCareUnitNameHandler);

// Rutas CRUD básicas
router.get('/', validateList, listHandler);
router.post('/', validateCreate, createHandler);
router.get('/:id', validateId, getHandler);
router.patch('/:id', validateUpdate, updateHandler);
router.delete('/:id', validateId, deleteHandler);

module.exports = router;

