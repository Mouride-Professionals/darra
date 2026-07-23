const logger = require('../config/logger');
const AppError = require('../utils/AppError');

const handleMongooseCastError = (err) =>
  new AppError(`Valeur invalide pour le champ "${err.path}": ${err.value}`, 400);

const handleMongooseDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`La valeur du champ "${field}" est déjà utilisée.`, 409, 'DUPLICATE_KEY');
};

const handleMongooseValidation = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message).join('; ');
  return new AppError(messages, 422, 'VALIDATION_ERROR');
};

const handleJWTError = () =>
  new AppError('Token invalide. Veuillez vous reconnecter.', 401, 'TOKEN_INVALID');

const handleJWTExpired = () =>
  new AppError('Votre session a expiré. Veuillez vous reconnecter.', 401, 'TOKEN_EXPIRED');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    code:   err.code,
    message: err.message,
    stack:  err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status:  err.status,
      code:    err.code,
      message: err.message,
    });
  } else {
    logger.error('UNEXPECTED ERROR', { err });
    res.status(500).json({ status: 'error', message: 'Une erreur inattendue est survenue.' });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode ?? 500;
  err.status = err.status ?? 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error(err.message, { stack: err.stack });
    return sendErrorDev(err, res);
  }

  let error = err;
  if (err.name === 'CastError')             error = handleMongooseCastError(err);
  if (err.code === 11000)                   error = handleMongooseDuplicateKey(err);
  if (err.name === 'ValidationError')       error = handleMongooseValidation(err);
  if (err.name === 'JsonWebTokenError')     error = handleJWTError();
  if (err.name === 'TokenExpiredError')     error = handleJWTExpired();

  sendErrorProd(error, res);
};

module.exports = errorHandler;
