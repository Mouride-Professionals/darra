const { verifyAccessToken } = require('../utils/tokens');
const { User, ROLES } = require('../models/User.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Authentification requise.', 401, 'NO_TOKEN');
  }

  const token = authHeader.split(' ')[1];
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    const code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
    throw new AppError('Token invalide ou expiré.', 401, code);
  }

  const user = await User.findById(payload.sub).select('+isActive');
  if (!user || !user.isActive) {
    throw new AppError('Utilisateur introuvable ou désactivé.', 401);
  }

  req.user = user;
  next();
});

/** Restricts access to specific roles */
const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new AppError("Vous n'avez pas les droits nécessaires.", 403, 'FORBIDDEN'));
    }
    next();
  };

const isSuperAdmin = authorize(ROLES.SUPER_ADMIN);
const isAdminOrAbove = authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN);

module.exports = { protect, authorize, isSuperAdmin, isAdminOrAbove };
