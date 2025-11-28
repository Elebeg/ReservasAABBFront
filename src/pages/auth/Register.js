import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    visible: false,
    type: 'success', // 'success' | 'error'
    message: ''
  });

  const navigate = useNavigate();

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast('error', 'As senhas não coincidem. Verifique e tente novamente.');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...dataToSend } = formData;
      await api.post('/auth/register', dataToSend);

      // Redireciona para login com flag de sucesso
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      console.error('Erro ao registrar:', err);

      const backendMessage =
        err?.response?.data?.message ||
        'Ocorreu um erro ao registrar. Por favor, tente novamente.';

      showToast('error', backendMessage);
    } finally {
      setLoading(false);
    }
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
          <h1>Crie sua conta e comece a reservar</h1>
          <p className="auth-info-subtitle">
            Em poucos passos você terá acesso completo ao painel de reservas
            e poderá organizar seus jogos e horários.
          </p>

          <div className="auth-notice">
            <strong>Aviso:</strong> o acesso ao sistema de reservas é exclusivo para usuários
            autenticados. Faça seu cadastro e realize o login para utilizar todas as funções.
          </div>

          <ul className="auth-feature-list">
            <li>✅ Acesso ao painel de reservas</li>
            <li>✅ Histórico de reservas realizadas</li>
            <li>✅ Controle simples e intuitivo dos horários</li>
          </ul>

          <p className="auth-small-hint">
            Depois de se registrar, é só fazer login para começar a utilizar o sistema.
          </p>
        </div>

        {/* Card de registro */}
        <div className="auth-card">
          <div className="auth-header">
            <h2>Criar conta</h2>
            <p>Cadastre-se para acessar o sistema exclusivo de reservas de quadra.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Nome completo</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

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
                placeholder="Mínimo de 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar senha</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Repita sua senha"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Já tem uma conta? <Link to="/login">Fazer login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
