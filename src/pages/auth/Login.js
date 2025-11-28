import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    visible: false,
    type: 'success', // 'success' | 'error'
    message: ''
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin } = useAuth();

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3500);
  };

  // Se veio do registro, exibir mensagem de sucesso
  useEffect(() => {
    if (location.state && location.state.registered) {
      showToast(
        'success',
        'Conta criada com sucesso! Faça login para acessar o sistema de reservas.'
      );
      // limpa o state para não mostrar de novo ao atualizar
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        showToast('success', 'Login realizado com sucesso! Redirecionando para o painel...');
        setTimeout(() => {
          navigate('/');
        }, 1200);
      } else {
        showToast('error', 'Não foi possível fazer login. Verifique seus dados e tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      showToast(
        'error',
        'Ocorreu um erro durante o login. Por favor, tente novamente em alguns instantes.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const success = await googleLogin(credentialResponse.credential);
      if (success) {
        showToast('success', 'Login com Google realizado! Redirecionando...');
        setTimeout(() => {
          navigate('/');
        }, 1200);
      } else {
        showToast('error', 'Não foi possível autenticar com o Google. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao fazer login com Google:', err);
      showToast(
        'error',
        'Ocorreu um erro com o Google. Por favor, tente novamente em alguns instantes.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    showToast('error', 'Erro na autenticação com Google. Por favor, tente novamente.');
  };

  return (
    <div className="auth-container">
      {/* TOAST GLOBAL */}
      {toast.visible && (
        <div className={`auth-toast auth-toast-${toast.type}`}>
          <span className="auth-toast-indicator" />
          <p>{toast.message}</p>
        </div>
      )}

      <div className="auth-wrapper">
        {/* Lado visual / marketing */}
        <div className="auth-info">
          <span className="auth-badge">Sistema de Reservas de Quadra</span>
          <h1>Organize seus jogos em poucos cliques</h1>
          <p className="auth-info-subtitle">
            Visualize a disponibilidade das quadras, crie reservas e gerencie seus horários
            em um só lugar.
          </p>

          <div className="auth-notice">
            <strong>Importante:</strong> somente usuários logados podem acessar o sistema de
            reservas de quadra.
          </div>

          <ul className="auth-feature-list">
            <li>✅ Ver disponibilidade em tempo real</li>
            <li>✅ Reservar quadras de forma rápida e segura</li>
            <li>✅ Gerenciar e cancelar reservas quando precisar</li>
          </ul>

          <p className="auth-small-hint">
            Crie sua conta em poucos segundos e comece a organizar seus jogos com mais facilidade.
          </p>
        </div>

        {/* Card de login */}
        <div className="auth-card">
          <div className="auth-header">
            <h2>Entrar na sua conta</h2>
            <p>Acesse para utilizar o sistema exclusivo de reservas de quadra.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="seuemail@exemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
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

          <div className="social-login">
            <p className="divider">ou continue com</p>
            <div className="google-login-container">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                text="continue_with"
                shape="pill"
                locale="pt_BR"
              />
            </div>
          </div>

          <div className="auth-footer">
            <p>
              Ainda não tem conta? <Link to="/register">Criar conta agora</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
