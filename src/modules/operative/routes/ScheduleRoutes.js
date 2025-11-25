const { Router } = require('express');

const {
    listHandler,
    getHandler,
    createHandler,
    updateHandler,
    deleteHandler,
    searchByProfessionalNameHandler,
    searchByCareUnitNameHandler,
} = require('../controllers/ScheduleController');

const {
    validateCreate,
    validateUpdate,
    validateId,
    validateList,
    validateSearchByName,
} = require('../validators/ScheduleValidator');

const router = Router();

router.get('/profesional', validateSearchByName, searchByProfessionalNameHandler);
router.get('/unidad', validateSearchByName, searchByCareUnitNameHandler);

router.get('/', validateList, listHandler);
router.post('/', validateCreate, createHandler);
router.get('/:id', validateId, getHandler);
router.patch('/:id', validateUpdate, updateHandler);
router.delete('/:id', validateId, deleteHandler);

module.exports = router;

