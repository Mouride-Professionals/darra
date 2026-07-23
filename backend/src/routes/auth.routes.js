const router = require('express').Router();
const ctrl   = require('../controllers/auth.controller');
const { protect, isSuperAdmin } = require('../middleware/auth.middleware');
const { validate, authSchemas } = require('../middleware/validate');

router.post('/register',
  protect, isSuperAdmin,
  validate(authSchemas.register),
  ctrl.register
);

router.post('/login',   validate(authSchemas.login), ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout',  protect, ctrl.logout);
router.get('/me',       protect, ctrl.getMe);
router.patch('/password',
  protect,
  validate(authSchemas.updatePassword),
  ctrl.updatePassword
);

module.exports = router;
