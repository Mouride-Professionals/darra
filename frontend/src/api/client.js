const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => { accessToken = token; };
export const clearAccessToken = () => { accessToken = null; };

async function tryRefresh() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST', credentials: 'include',
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAccessToken(data.data.accessToken);
      return data.data.accessToken;
    })
    .finally(() => { refreshPromise = null; });

  return refreshPromise;
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options, headers, credentials: 'include',
  });

  if (res.status === 401) {
    const body = await res.json().catch(() => ({}));
    if (body.code === 'TOKEN_EXPIRED') {
      try {
        const newToken = await tryRefresh();
        headers.Authorization = `Bearer ${newToken}`;
        const retry = await fetch(`${BASE_URL}${path}`, {
          ...options, headers, credentials: 'include',
        });
        if (!retry.ok) {
          const errBody = await retry.json().catch(() => ({}));
          throw new ApiError(errBody.message || 'Erreur', retry.status, errBody.code);
        }
        return retry.json();
      } catch {
        clearAccessToken();
        window.dispatchEvent(new Event('auth:logout'));
        throw new ApiError('Session expirée. Veuillez vous reconnecter.', 401, 'SESSION_EXPIRED');
      }
    }
    throw new ApiError(body.message || 'Non autorisé', 401, body.code);
  }

  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) throw new ApiError(data.message || 'Erreur', res.status, data.code);
  return data;
}

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const api = {
  get:    (path, opts)         => request(path, { ...opts, method: 'GET' }),
  post:   (path, body, opts)   => request(path, { ...opts, method: 'POST',  body: JSON.stringify(body) }),
  patch:  (path, body, opts)   => request(path, { ...opts, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path, opts)         => request(path, { ...opts, method: 'DELETE' }),
};
