import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const API_URL = 'https://reservasaabb-production.up.railway.app';

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('admin_token')}` };
}

// ── Ícones (SVG, sem emoji) ────────────────────────────────────────────────
const Icon = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  ),
};

const NAV = [
  { key: 'dashboard',    label: 'Dashboard',   icon: Icon.dashboard },
  { key: 'users',        label: 'Usuários',    icon: Icon.users },
  { key: 'reservations', label: 'Reservas',    icon: Icon.calendar },
  { key: 'championship', label: 'Campeonatos', icon: Icon.trophy },
];

const PAGE_META = {
  dashboard:    { title: 'Visão geral',  subtitle: 'Resumo do clube em tempo real' },
  users:        { title: 'Usuários',     subtitle: 'Gerencie as contas cadastradas' },
  reservations: { title: 'Reservas',     subtitle: 'Todas as reservas de quadra' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const fetchData = useCallback(async (current) => {
    setLoading(true);
    try {
      if (current === 'dashboard') {
        const res = await fetch(`${API_URL}/admin/dashboard`, { headers: authHeader() });
        if (res.status === 401 || res.status === 403) { logout(); return; }
        setStats(await res.json());
      }
      if (current === 'users') {
        const res = await fetch(`${API_URL}/admin/users`, { headers: authHeader() });
        if (res.status === 401 || res.status === 403) { logout(); return; }
        setUsers(await res.json());
      }
      if (current === 'reservations') {
        const res = await fetch(`${API_URL}/admin/reservations`, { headers: authHeader() });
        if (res.status === 401 || res.status === 403) { logout(); return; }
        setReservations(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab !== 'championship') fetchData(tab);
  }, [tab, fetchData]);

  function logout() {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  }

  async function deleteUser(id) {
    if (!window.confirm('Remover este usuário?')) return;
    await fetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE', headers: authHeader() });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  async function deleteReservation(id) {
    if (!window.confirm('Cancelar esta reserva?')) return;
    await fetch(`${API_URL}/admin/reservations/${id}`, { method: 'DELETE', headers: authHeader() });
    setReservations((prev) => prev.filter((r) => r.id !== id));
  }

  function formatDateTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.toLocaleDateString('pt-BR')} · ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }

  const meta = PAGE_META[tab] || PAGE_META.dashboard;

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">AB</span>
          <span className="admin-brand-text">
            <strong>AABB</strong>
            <small>Painel administrativo</small>
          </span>
        </div>

        <nav className="admin-nav">
          {NAV.map((item) => (
            <button
              key={item.key}
              className={`admin-nav-item${tab === item.key ? ' is-active' : ''}`}
              onClick={() => item.key === 'championship' ? navigate('/admin/campeonato') : setTab(item.key)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <a href="/" className="admin-side-link">← Voltar ao site</a>
          <button onClick={logout} className="admin-logout">
            <span className="admin-nav-icon">{Icon.logout}</span>
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1 className="admin-title">{meta.title}</h1>
            <p className="admin-subtitle">{meta.subtitle}</p>
          </div>
          <button className="admin-refresh" onClick={() => fetchData(tab)} disabled={loading}>
            <span className={`admin-refresh-icon${loading ? ' is-spinning' : ''}`}>{Icon.refresh}</span>
            {loading ? 'Atualizando…' : 'Atualizar'}
          </button>
        </header>

        {/* Dashboard */}
        {tab === 'dashboard' && (
          <div className="admin-stats">
            <StatCard label="Usuários cadastrados" value={stats?.totalUsers} icon={Icon.users} accent="indigo" />
            <StatCard label="Total de reservas" value={stats?.totalReservations} icon={Icon.calendar} accent="emerald" />
            <StatCard label="Reservas hoje" value={stats?.reservationsToday} icon={Icon.dashboard} accent="amber" />
          </div>
        )}

        {/* Usuários */}
        {tab === 'users' && (
          <section className="admin-card">
            <div className="admin-card-head">
              <h2>Usuários <span className="admin-count">{users.length}</span></h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Nome</th><th>Email</th><th>Verificado</th><th>Google</th><th className="ta-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="admin-mono">#{u.id}</td>
                      <td className="admin-strong">{u.name}</td>
                      <td className="admin-muted">{u.email}</td>
                      <td>
                        <span className={`admin-pill ${u.emailVerified ? 'pill-ok' : 'pill-off'}`}>
                          {u.emailVerified ? 'Verificado' : 'Pendente'}
                        </span>
                      </td>
                      <td>
                        {u.googleId
                          ? <span className="admin-pill pill-info">Google</span>
                          : <span className="admin-dash">—</span>}
                      </td>
                      <td className="ta-right">
                        <button onClick={() => deleteUser(u.id)} className="admin-btn-danger">Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && users.length === 0 && <div className="admin-empty">Nenhum usuário cadastrado.</div>}
            </div>
          </section>
        )}

        {/* Reservas */}
        {tab === 'reservations' && (
          <section className="admin-card">
            <div className="admin-card-head">
              <h2>Reservas <span className="admin-count">{reservations.length}</span></h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Data / Horário</th><th>Usuário</th><th>Quadra</th><th className="ta-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r.id}>
                      <td className="admin-mono">#{r.id}</td>
                      <td className="admin-strong">{formatDateTime(r.startTime)}</td>
                      <td className="admin-muted">{r.user?.name ?? '—'}</td>
                      <td><span className="admin-pill pill-neutral">{r.court?.name ?? '—'}</span></td>
                      <td className="ta-right">
                        <button onClick={() => deleteReservation(r.id)} className="admin-btn-danger">Cancelar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && reservations.length === 0 && <div className="admin-empty">Nenhuma reserva encontrada.</div>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div className={`admin-stat accent-${accent}`}>
      <span className="admin-stat-icon">{icon}</span>
      <div className="admin-stat-body">
        <span className="admin-stat-value">{value ?? '—'}</span>
        <span className="admin-stat-label">{label}</span>
      </div>
    </div>
  );
}
