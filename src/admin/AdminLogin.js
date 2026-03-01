import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Login normal para obter JWT
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        setError('Email ou senha inválidos.');
        return;
      }

      const { access_token } = await loginRes.json();

      // 2. Valida se o token tem permissão de admin
      const checkRes = await fetch(`${API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!checkRes.ok) {
        setError('Acesso negado: você não tem permissão de administrador.');
        return;
      }

      localStorage.setItem('admin_token', access_token);
      navigate('/admin/dashboard');
    } catch {
      setError('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoArea}>
          <div style={s.logoIcon}>⚙️</div>
          <h1 style={s.title}>Painel Administrativo</h1>
          <p style={s.subtitle}>AABB Jandaia do Sul</p>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.group}>
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@exemplo.com"
              required
              autoComplete="username"
            />
          </div>

          <div style={s.group}>
            <label style={s.label}>Senha</label>
            <input
              style={s.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div style={s.error}>{error}</div>}

          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={s.backLink}>
          <a href="/" style={s.backAnchor}>← Voltar ao site</a>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    padding: 20,
  },
  card: {
    background: '#1e293b',
    borderRadius: 16,
    padding: '40px 44px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    border: '1px solid #334155',
  },
  logoArea: { textAlign: 'center', marginBottom: 32 },
  logoIcon: { fontSize: 40, marginBottom: 12 },
  title:    { color: '#f8fafc', fontSize: 22, fontWeight: 700, margin: '0 0 6px' },
  subtitle: { color: '#64748b', fontSize: 14, margin: 0 },
  form:     { display: 'flex', flexDirection: 'column', gap: 16 },
  group:    { display: 'flex', flexDirection: 'column', gap: 6 },
  label:    { color: '#94a3b8', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    background: '#0f172a',
    border: '1.5px solid #334155',
    borderRadius: 8,
    padding: '11px 14px',
    color: '#f8fafc',
    fontSize: 15,
    fontFamily: 'inherit',
    outline: 'none',
  },
  error: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.4)',
    color: '#fca5a5',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 14,
  },
  btn: {
    marginTop: 8,
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '13px',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  backLink:   { textAlign: 'center', marginTop: 24, marginBottom: 0 },
  backAnchor: { color: '#64748b', fontSize: 13, textDecoration: 'none' },
};
