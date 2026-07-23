const router = require('express').Router();
const ctrl   = require('../controllers/daara.controller');
const { protect, isAdminOrAbove } = require('../middleware/auth.middleware');
const { validate, daaraSchemas }  = require('../middleware/validate');

/* Public read endpoins */
router.get('/',               validate(daaraSchemas.query, 'query'), ctrl.getAll);
router.get('/stats',          ctrl.getStats);
router.get('/concentration',  ctrl.getConcentration);
router.get('/:id',            ctrl.getById);

/* Protected write endpoint */
router.use(protect, isAdminOrAbove);
router.post('/',    validate(daaraSchemas.create), ctrl.create);
router.patch('/:id', validate(daaraSchemas.update), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
