const { User, ROLES } = require('../models/User.model');
const AppError = require('../utils/AppError');
const {
  signAccessToken, signRefreshToken,
  verifyRefreshToken, hashToken, compareTokenHash,
} = require('../utils/tokens');

/** Build the JWT payload (minimum surface area) */
const buildPayload = (user) => ({
  sub: user._id.toString(),
  role: user.role,
  quartierAssigne: user.quartierAssigne?.toString() ?? null,
});

/** Generates a token pair and persists the refresh token hash */
const issueTokenPair = async (user) => {
  const payload = buildPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshTokenHash = await hashToken(refreshToken);
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const register = async ({ nom, email, password, role, quartierAssigne }, requestingUser) => {
  /* Only SUPER_ADMIN can create other admins */
  if (role && role !== ROLES.LECTEUR) {
    if (!requestingUser || requestingUser.role !== ROLES.SUPER_ADMIN) {
      throw new AppError('Seul un SUPER_ADMIN peut attribuer ce rôle.', 403);
    }
  }

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Cet email est déjà utilisé.', 409, 'EMAIL_TAKEN');

  const user = await User.create({ nom, email, password, role: role ?? ROLES.LECTEUR, quartierAssigne });
  return user.toSafeObject();
};

const login = async (email, password) => {
  const user = await User.findOne({ email, isActive: true }).select('+password +refreshTokenHash');
  if (!user) throw new AppError('Identifiants invalides.', 401, 'INVALID_CREDENTIALS');

  const match = await user.comparePassword(password);
  if (!match) throw new AppError('Identifiants invalides.', 401, 'INVALID_CREDENTIALS');

  const tokens = await issueTokenPair(user);
  return { tokens, user: user.toSafeObject() };
};

const refresh = async (rawRefreshToken) => {
  if (!rawRefreshToken) throw new AppError('Token de rafraîchissement manquant.', 401);

  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError('Token de rafraîchissement invalide ou expiré.', 401, 'REFRESH_EXPIRED');
  }

  const user = await User.findById(payload.sub).select('+refreshTokenHash');
  if (!user || !user.isActive) throw new AppError('Utilisateur introuvable ou désactivé.', 401);

  const valid = await compareTokenHash(rawRefreshToken, user.refreshTokenHash);
  if (!valid) throw new AppError('Token de rafraîchissement révoqué.', 401, 'TOKEN_REUSE');

  /* Rotate refresh token */
  const tokens = await issueTokenPair(user);
  return { tokens, user: user.toSafeObject() };
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
};

const getMe = async (userId) => {
  const user = await User.findById(userId).populate('quartierAssigne', 'nomAr nomFr');
  if (!user) throw new AppError('Utilisateur introuvable.', 404);
  return user.toSafeObject();
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('Utilisateur introuvable.', 404);

  const match = await user.comparePassword(currentPassword);
  if (!match) throw new AppError('Mot de passe actuel incorrect.', 400, 'WRONG_PASSWORD');

  user.password = newPassword;
  await user.save();
};

module.exports = { register, login, refresh, logout, getMe, updatePassword };
