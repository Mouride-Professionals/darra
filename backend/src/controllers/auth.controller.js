const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { setRefreshCookie, clearRefreshCookie } = require('../utils/tokens');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body, req.user ?? null);
  res.status(201).json({ status: 'success', data: { user } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { tokens, user } = await authService.login(email, password);

  setRefreshCookie(res, tokens.refreshToken);
  res.status(200).json({
    status: 'success',
    data: { accessToken: tokens.accessToken, user },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.refreshToken;
  const { tokens, user } = await authService.refresh(rawToken);

  setRefreshCookie(res, tokens.refreshToken);
  res.status(200).json({
    status: 'success',
    data: { accessToken: tokens.accessToken, user },
  });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);
  clearRefreshCookie(res);
  res.status(204).send();
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  res.status(200).json({ status: 'success', data: { user } });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.updatePassword(req.user._id, currentPassword, newPassword);
  res.status(200).json({ status: 'success', message: 'Mot de passe mis à jour.' });
});

module.exports = { register, login, refresh, logout, getMe, updatePassword };
