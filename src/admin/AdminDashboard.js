import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://reservasaabb-production.up.railway.app';

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('admin_token')}` };
}

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
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }

  const tabs = ['dashboard', 'users', 'reservations', 'championship'];

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>⚙️ Admin</div>
        <nav style={styles.nav}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => t === 'championship' ? navigate('/admin/campeonato') : setTab(t)}
              style={{ ...styles.navItem, ...(tab === t ? styles.navItemActive : {}) }}
            >
              {t === 'dashboard'    && '📊 Dashboard'}
              {t === 'users'        && '👤 Usuários'}
              {t === 'reservations' && '📅 Reservas'}
              {t === 'championship' && '🏆 Campeonatos'}
            </button>
          ))}
        </nav>
        <a href="/" style={styles.backSiteBtn}>← Voltar ao site</a>
        <button onClick={logout} style={styles.logoutBtn}>Sair</button>
      </aside>

      <main style={styles.main}>
        {loading && <p style={styles.loading}>Carregando...</p>}

        {tab === 'dashboard' && stats && (
          <div>
            <h2 style={styles.heading}>Visão Geral</h2>
            <div style={styles.statsGrid}>
              <StatCard label="Usuários cadastrados" value={stats.totalUsers}        emoji="👤" />
              <StatCard label="Total de reservas"    value={stats.totalReservations} emoji="📅" />
              <StatCard label="Reservas hoje"        value={stats.reservationsToday} emoji="📆" />
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div>
            <h2 style={styles.heading}>Usuários ({users.length})</h2>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr><Th>ID</Th><Th>Nome</Th><Th>Email</Th><Th>Verificado</Th><Th>Google</Th><Th>Ações</Th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={styles.tr}>
                      <td style={styles.td}>{u.id}</td>
                      <td style={styles.td}>{u.name}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>{u.emailVerified ? '✅' : '❌'}</td>
                      <td style={styles.td}>{u.googleId ? '✅' : '—'}</td>
                      <td style={styles.td}>
                        <button onClick={() => deleteUser(u.id)} style={styles.deleteBtn}>Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'reservations' && (
          <div>
            <h2 style={styles.heading}>Reservas ({reservations.length})</h2>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr><Th>ID</Th><Th>Data / Horário</Th><Th>Usuário</Th><Th>Quadra</Th><Th>Ações</Th></tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r.id} style={styles.tr}>
                      <td style={styles.td}>{r.id}</td>
                      <td style={styles.td}>{formatDateTime(r.startTime)}</td>
                      <td style={styles.td}>{r.user?.name ?? '—'}</td>
                      <td style={styles.td}>{r.court?.name ?? '—'}</td>
                      <td style={styles.td}>
                        <button onClick={() => deleteReservation(r.id)} style={styles.deleteBtn}>Cancelar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, emoji }) {
  return (
    <div style={styles.statCard}>
      <span style={styles.statEmoji}>{emoji}</span>
      <span style={styles.statValue}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

function Th({ children }) {
  return <th style={styles.th}>{children}</th>;
}

const styles = {
  page:          { display: 'flex', minHeight: '100vh', background: '#0f172a', color: '#f8fafc' },
  sidebar:       { width: 220, background: '#1e293b', display: 'flex', flexDirection: 'column', padding: '24px 16px', gap: 4, flexShrink: 0 },
  sidebarLogo:   { fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 24, paddingLeft: 8 },
  nav:           { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  navItem:       { background: 'transparent', border: 'none', color: '#94a3b8', textAlign: 'left', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 },
  navItemActive: { background: '#334155', color: '#f8fafc' },
  backSiteBtn:   { display: 'block', textAlign: 'center', marginTop: 'auto', marginBottom: 8, background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, padding: '10px 12px', cursor: 'pointer', fontSize: 13, textDecoration: 'none' },
  logoutBtn:     { background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, padding: '10px 12px', cursor: 'pointer', fontSize: 14 },
  main:          { flex: 1, padding: '32px 40px', overflowY: 'auto' },
  heading:       { color: '#f8fafc', fontSize: 22, fontWeight: 700, marginBottom: 24 },
  loading:       { color: '#94a3b8', fontSize: 14 },
  statsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
  statCard:      { background: '#1e293b', borderRadius: 12, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 8 },
  statEmoji:     { fontSize: 28 },
  statValue:     { fontSize: 36, fontWeight: 700, color: '#3b82f6' },
  statLabel:     { fontSize: 13, color: '#94a3b8' },
  tableWrap:     { overflowX: 'auto' },
  table:         { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th:            { textAlign: 'left', color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 12px', borderBottom: '1px solid #1e293b' },
  tr:            { borderBottom: '1px solid #1e293b' },
  td:            { padding: '12px 12px', color: '#cbd5e1', verticalAlign: 'middle' },
  deleteBtn:     { background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
};
