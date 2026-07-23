import { api } from './client';

/* ── Authe ── */
export const authApi = {
  login: (body) => api.post('/auth/login', body),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
  register: (body) => api.post('/auth/register', body),
  updatePassword: (body) => api.patch('/auth/password', body),
};

/* ── Quartierss ── */
export const quartierApi = {
  getAll:  () => api.get('/quartiers'),
  create:  (body) => api.post('/quartiers', body),
  update:  (id, body) => api.patch(`/quartiers/${id}`, body),
  remove:  (id) => api.delete(`/quartiers/${id}`),
};

/* ── Daaras ── */
export const daaraApi = {
  getAll: (params = {}) => api.get(`/daara?${new URLSearchParams(params)}`),
  getById: (id) => api.get(`/daara/${id}`),
  getStats: () => api.get('/daara/stats'),
  getConcentration:() => api.get('/daara/concentration'),
  create: (body) => api.post('/daara', body),
  update: (id, body) => api.patch(`/daara/${id}`, body),
  remove: (id) => api.delete(`/daara/${id}`),
};

/* ── Users ── */
