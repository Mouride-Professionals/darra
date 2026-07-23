const router = require('express').Router();
const ctrl   = require('../controllers/quartier.controller');
const { protect, isSuperAdmin }       = require('../middleware/auth.middleware');
const { validate, quartierSchemas }   = require('../middleware/validate');

router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getById);

/* ONLy SUPER_ADMIN can mutate quartiers */
router.use(protect, isSuperAdmin);
router.post('/',     validate(quartierSchemas.create), ctrl.create);
router.patch('/:id', validate(quartierSchemas.update), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
