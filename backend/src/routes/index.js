const router = require('express').Router();

router.use('/auth',      require('./auth.routes'));
router.use('/daara',     require('./daara.routes'));
router.use('/quartiers', require('./quartier.routes'));

/* Haelth check */
router.get('/health', (req, res) =>
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
);

module.exports = router;
