import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};

const API_URL = 'https://reservasaabb-production.up.railway.app';

// Verifica acesso admin silenciosamente — nunca lança exceção, timeout 3s
async function checkAdminAccess(token) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

// Valida JWT localmente sem chamada de rede
function isTokenValid(token) {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

    // Inicializa sessão — verifica localStorage e sessionStorage
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token || !isTokenValid(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('admin_token');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setUser(null);
      setLoading(false);
      return;
    }

    // Token válido: restaura usuário salvo
    try {
      const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      setUser(null);
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe = true) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', access_token);
      storage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(userData);

      // Detecta admin em background (não bloqueia o login)
      checkAdminAccess(access_token).then((isAdmin) => {
        if (isAdmin) localStorage.setItem('admin_token', access_token);
        else localStorage.removeItem('admin_token');
      });

      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential, rememberMe = true) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/google', { credential });
      const { access_token, user: userData } = response.data;

      if (!access_token) throw new Error('Token não recebido do servidor');

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', access_token);
      storage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(userData);

      checkAdminAccess(access_token).then((isAdmin) => {
        if (isAdmin) localStorage.setItem('admin_token', access_token);
        else localStorage.removeItem('admin_token');
      });

      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao fazer login com Google.';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao registrar usuário.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin_token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? isTokenValid(token) : false;
  };

  const getUserId = () => user?.id ?? null;
  const getToken  = () => localStorage.getItem('token') || sessionStorage.getItem('token');
  const hasRole   = (role) => user?.roles?.includes(role) ?? false;

  return (
    <AuthContext.Provider value={{
      user, loading, error,
      login, googleLogin, register, logout,
      isAuthenticated, getUserId, getToken, hasRole,
      setError, setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
