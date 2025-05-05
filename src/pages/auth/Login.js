import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './Auth.css';
import api from '../../services/api';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, setError: setAuthError } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError('Ocorreu um erro durante o login. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const googleUser = jwtDecode(credential); 

      const response = await api.post('https://reservasaabb-production.up.railway.app/auth/google', { credential });

      const { access_token, user } = response.data;

      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      window.location.href = '/'; 
    } catch (err) {
      console.error('Erro no login com Google:', err);
      setError('Falha no login com Google.');
      setAuthError('Falha no login com Google.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Login</h2>
          <p>Faça login para acessar o sistema de reservas</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <a 
  href="https://reservasaabb-production.up.railway.app/auth/google" 
  className="btn-google"
>
  Entrar com Google
</a>


        <div className="auth-footer">
          <p>Não tem uma conta? <Link to="/register">Registre-se</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
