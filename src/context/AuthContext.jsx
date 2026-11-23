import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const ROLE_LABELS = {
  student: 'Student',
  faculty: 'Faculty',
  support: 'Disability Support',
  admin: 'College Administrator',
};

export const ROLE_HOME = {
  student: '/dashboard',
  faculty: '/faculty',
  support: '/support-admin',
  admin: '/admin',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    authApi.me()
      .then((u) => { if (alive) setUser(u); })
      .catch((error) => { console.warn('Session could not be restored:', error.message); setUser(null); })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const login = useCallback(async (creds) => {
    const { user: u } = await authApi.login(creds);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: u } = await authApi.register(payload);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  // Persist outside a React state updater: updaters must be pure and errors must
  // reach the form handler, not the render phase (especially in StrictMode).
  const updateUser = useCallback((patch) => {
    if (!user) throw new Error('Sign in to edit your profile.');
    const next = authApi.updateProfile(user.id, patch);
    setUser(next);
    return next;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const check = () => authApi.me().then(current=>setUser(current)).catch(error=>{console.warn('Session check failed:',error.message);setUser(null);});
    const timer=setInterval(check, 30000);
    window.addEventListener('focus',check);
    return ()=>{clearInterval(timer);window.removeEventListener('focus',check);};
  }, [user]);

  const value = useMemo(() => ({ user, loading, login, register, logout, updateUser, role: user?.role }), [user, loading, login, register, logout, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
