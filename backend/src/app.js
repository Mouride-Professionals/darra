require('dotenv').config();

const express     = require('express');
const helmet      = require('helmet');
const cors        = require('cors');
const morgan      = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit   = require('express-rate-limit');

const { connect } = require('./config/database');
const logger      = require('./config/logger');
const routes      = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const AppError    = require('./utils/AppError');

const app = express();

/* ── Security headers ── */
app.use(helmet());

/* ── CORS ── */
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/* ── Rate limiting ── */
const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      Number(process.env.RATE_LIMIT_MAX)        || 100,
  standardHeaders: true, legacyHeaders: false,
  message: { status: 'fail', message: 'Trop de requêtes, réessayez plus tard.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: { status: 'fail', message: 'Trop de tentatives de connexion.' },
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

/* ── Body parsing ── */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ── NoSQL injection sanitization ── */
app.use(mongoSanitize());

/* ── HTTP logging ── */
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

/* ── Routes ── */
app.use('/api', routes);

/* ── 404 handler ── */
app.all('*', (req, _res, next) =>
  next(new AppError(`Route ${req.method} ${req.originalUrl} introuvable.`, 404))
);

/* ── Global error handler ── */
app.use(errorHandler);

/* ── Bootstrap ── */
const PORT = process.env.PORT || 5001;

const start = async () => {
  try {
    await connect();
    app.listen(PORT, () =>
      logger.info(`Serveur démarré sur le port ${PORT} [${process.env.NODE_ENV}]`)
    );
  } catch (err) {
    logger.error('Échec du démarrage', { err });
    process.exit(1);
  }
};

/* ── Graceful shutdown ── */
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', { err });
  process.exit(1);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM reçu. Arrêt propre...');
  const { disconnect } = require('./config/database');
  await disconnect();
  process.exit(0);
});

start();

module.exports = app;
