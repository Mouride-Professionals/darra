import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../api';
import { setAccessToken, clearAccessToken } from '../api/client';

const AuthContext = createContext(null);

export const ROLES = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  LECTEUR: 'LECTEUR',
});

export function AuthProvider({ children }) {
  const [user, setUser]  = useState(null);
  const [loading, setLoading] = useState(true);  // true until initial check done
  const [error, setError] = useState(null);
  const silentRefreshTimer = useRef(null);

  /* Schedule a silent token refresh before expiry (every 13 min for 15 min tokens) */
  const scheduleRefresh = useCallback(() => {
    clearTimeout(silentRefreshTimer.current);
    silentRefreshTimer.current = setTimeout(async () => {
      try {
        const data = await authApi.refresh();
        setAccessToken(data.data.accessToken);
        setUser(data.data.user);
        scheduleRefresh();
      } catch {
        setUser(null);
        clearAccessToken();
      }
    }, 13 * 60 * 1000);
  }, []);

  /* Bootstrap: attempt silent refresh from httpOnly cookie */
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const data = await authApi.refresh();
        setAccessToken(data.data.accessToken);
        setUser(data.data.user);
        scheduleRefresh();
      } catch {
        /* No valid refresh token — user needs to log in */
      } finally {
        setLoading(false);
      }
    };
    bootstrap();

    /* Listen for forced logout triggered by 401 in API client */
    const handleForceLogout = () => { setUser(null); clearAccessToken(); };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => {
      window.removeEventListener('auth:logout', handleForceLogout);
      clearTimeout(silentRefreshTimer.current);
    };
  }, [scheduleRefresh]);

  const login = useCallback(async (email, password) => {
    setError(null);
    const data = await authApi.login({ email, password });
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    scheduleRefresh();
    return data.data.user;
  }, [scheduleRefresh]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearAccessToken();
    clearTimeout(silentRefreshTimer.current);
    setUser(null);
  }, []);

  /* Role helpers */
  const isSuperAdmin  = user?.role === ROLES.SUPER_ADMIN;
  const isAdmin = user?.role === ROLES.ADMIN || isSuperAdmin;
  const canWrite = isAdmin;
  const canManageQuartiers = isSuperAdmin;

  const value = {
    user, loading, error, setError,
    login, logout,
    isAuthenticated: !!user,
    isSuperAdmin, isAdmin, canWrite, canManageQuartiers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
