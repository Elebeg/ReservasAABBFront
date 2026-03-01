import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};

const API_URL = 'https://aabbjdsreservas.com';

// Verifica se o token tem permissão de admin
async function checkAdminAccess(token) {
  try {
    const res = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Verifica token existente ao iniciar
  useEffect(() => {
    const checkToken = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) { setUser(null); return; }

        const decoded = jwtDecode(token);
        if (decoded.exp < Date.now() / 1000) { logout(); return; }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get(`/users/${decoded.sub}`);
        setUser(response.data);

        // Re-verifica acesso admin (ex: após refresh da página)
        const isAdmin = await checkAdminAccess(token);
        if (isAdmin) {
          localStorage.setItem('admin_token', token);
        } else {
          localStorage.removeItem('admin_token');
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;

      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(userData);

      // Detecta se é admin e salva o token de admin
      const isAdmin = await checkAdminAccess(access_token);
      if (isAdmin) {
        localStorage.setItem('admin_token', access_token);
      } else {
        localStorage.removeItem('admin_token');
      }

      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/google', { credential });
      const { access_token, user: userData } = response.data;

      if (!access_token) throw new Error('Token não recebido do servidor');

      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(userData);

      // Detecta admin no Google login também
      const isAdmin = await checkAdminAccess(access_token);
      if (isAdmin) {
        localStorage.setItem('admin_token', access_token);
      } else {
        localStorage.removeItem('admin_token');
      }

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
    localStorage.removeItem('admin_token'); // limpa admin junto
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp < Date.now() / 1000) { logout(); return false; }
      return true;
    } catch {
      logout();
      return false;
    }
  };

  const getUserId  = () => user?.id ?? null;
  const getToken   = () => localStorage.getItem('token');
  const hasRole    = (role) => user?.roles?.includes(role) ?? false;

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
