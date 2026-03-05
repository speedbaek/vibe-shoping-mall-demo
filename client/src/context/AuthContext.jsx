import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, getMe, setAuthTokenGetter } from '../utils/api';

const STORAGE_KEYS = { token: 'auth_token', user: 'auth_user', remember: 'auth_remember' };

function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.token) || sessionStorage.getItem(STORAGE_KEYS.token);
}

function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user) || sessionStorage.getItem(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredAuth(token, user, remember) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(STORAGE_KEYS.token, token);
  storage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  if (remember) localStorage.setItem(STORAGE_KEYS.remember, '1');
  else sessionStorage.setItem(STORAGE_KEYS.remember, '0');
}

function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.remember);
  sessionStorage.removeItem(STORAGE_KEYS.token);
  sessionStorage.removeItem(STORAGE_KEYS.user);
  sessionStorage.removeItem(STORAGE_KEYS.remember);
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(!!getStoredToken());

  const login = useCallback(async (email, password, remember = false) => {
    const { token, user: userData } = await apiLogin({ email, password });
    setStoredAuth(token, userData, remember);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
  }, []);

  /**
   * 저장된 토큰으로 서버에서 유저 정보 조회 후 상태/스토리지 갱신
   * 프로필 수정 후 등, 필요할 때 호출
   */
  const getUserByToken = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return null;
    const userData = await getMe();
    setUser(userData);
    const remember = localStorage.getItem(STORAGE_KEYS.remember) === '1';
    setStoredAuth(token, userData, remember);
    return userData;
  }, []);

  useEffect(() => {
    setAuthTokenGetter(getStoredToken);
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then((userData) => {
        setUser(userData);
        const raw = localStorage.getItem(STORAGE_KEYS.user) || sessionStorage.getItem(STORAGE_KEYS.user);
        if (!raw || JSON.stringify(userData) !== raw) {
          const remember = localStorage.getItem(STORAGE_KEYS.remember) === '1';
          setStoredAuth(token, userData, remember);
        }
      })
      .catch(() => {
        clearStoredAuth();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    login,
    logout,
    getUserByToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { getStoredToken };
