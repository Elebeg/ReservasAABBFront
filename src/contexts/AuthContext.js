// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Certifique-se de ter esta dependência instalada

// Criando o contexto
const AuthContext = createContext();

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provider do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para verificar o token existente ao iniciar a aplicação
  useEffect(() => {
    const checkToken = async () => {
      setLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Verificar se o token está expirado
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token expirado
          logout();
          setLoading(false);
          return;
        }
        
        // Configurar o token no cabeçalho de autorização
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verificar a validade do token fazendo uma requisição para obter dados do usuário
        const response = await api.get(`/users/${decodedToken.sub}`);
        
        setUser(response.data);
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        logout(); // Limpar dados em caso de erro
      } finally {
        setLoading(false);
      }
    };
    
    checkToken();
  }, []);

  // Função de login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      
      // Armazenar token e dados do usuário
      localStorage.setItem('token', access_token);
      
      // Configurar cabeçalho de autorização para futuras requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setUser(userData);
      return true;
    } catch (err) {
      console.error('Erro de login:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Função de registro
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      console.error('Erro ao registrar:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao registrar usuário.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Verificar se o usuário está autenticado
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return false;
    }
    
    try {
      // Verificar se o token está expirado
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decodedToken.exp < currentTime) {
        logout();
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Erro ao verificar token:', err);
      logout();
      return false;
    }
  };

  // Obter ID do usuário do token
  const getUserId = () => {
    if (!user) return null;
    return user.id;
  };

  // Obter token atual
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Verificar se o usuário tem determinada função (role)
  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  // Valores e funções expostos pelo contexto
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    getUserId,
    getToken,
    hasRole,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;