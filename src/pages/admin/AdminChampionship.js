import React, { useState, useEffect, useCallback } from 'react';
import defaultBadge from '../../assets/default-team-badge.svg';
import { useNavigate } from 'react-router-dom';
import './AdminChampionship.css';

const API = 'https://reservasaabb-production.up.railway.app';

function adminHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
  };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...adminHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Erro ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ─── UTILITÁRIOS ─────────────────────────────────────────────────────────────

const FORMAT_LABELS = {
  GROUPS:   'Fase de Grupos',
  LEAGUE:   'Liga (todos x todos)',
  KNOCKOUT: 'Mata-Mata Direto',
};

const STATUS_LABELS = {
  DRAFT:          'Rascunho',
  GROUP_STAGE:    'Fase de Grupos',
  KNOCKOUT_STAGE: 'Mata-Mata',
  FINISHED:       'Encerrado',
};

const PHASE_LABELS = {
  GROUP:         'Grupos',
  ROUND_OF_16:   'Oitavas',
  QUARTER_FINAL: 'Quartas',
  SEMI_FINAL:    'Semi',
  FINAL:         'Final',
};

function StatusBadge({ status }) {
  const cls = {
    DRAFT:          'ac-status-draft',
    GROUP_STAGE:    'ac-status-group',
    KNOCKOUT_STAGE: 'ac-status-knockout',
    FINISHED:       'ac-status-finished',
  }[status] || 'ac-status-draft';
  return <span className={`ac-status ${cls}`}>{STATUS_LABELS[status] || status}</span>;
}

function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`ac-alert ac-alert-${type}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
      )}
    </div>
  );
}

// ─── MODAL WRAPPER ────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div className="ac-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ac-modal">
        <div className="ac-modal-header">
          <h3>{title}</h3>
          <button className="ac-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="ac-modal-body">{children}</div>
      </div>
    </div>
  );
}

// ─── CRIAR TORNEIO ────────────────────────────────────────────────────────────

function CreateTournamentModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '', description: '', format: 'GROUPS',
    groupCount: 2, teamsAdvancing: 2, startDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        groupCount: Number(form.groupCount),
        teamsAdvancing: Number(form.teamsAdvancing),
        startDate: form.startDate || undefined,
      };
      const t = await apiFetch('/admin/championship/tournaments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      onCreated(t);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Novo Torneio" onClose={onClose}>
      <form className="ac-form" onSubmit={submit}>
        <Alert type="error" message={error} onClose={() => setError('')} />

        <div className="ac-form-group">
          <label>Nome do Torneio *</label>
          <input value={form.name} onChange={(e) => handle('name', e.target.value)} required placeholder="Ex: Campeonato AABB 2025" />
        </div>

        <div className="ac-form-group">
          <label>Descrição</label>
          <textarea value={form.description} onChange={(e) => handle('description', e.target.value)} placeholder="Informações adicionais..." />
        </div>

        <div className="ac-form-row">
          <div className="ac-form-group">
            <label>Formato *</label>
            <select value={form.format} onChange={(e) => handle('format', e.target.value)}>
              <option value="GROUPS">Fase de Grupos → Mata-Mata</option>
              <option value="LEAGUE">Liga (todos x todos)</option>
              <option value="KNOCKOUT">Mata-Mata Direto</option>
            </select>
          </div>
          <div className="ac-form-group">
            <label>Data de Início</label>
            <input type="date" value={form.startDate} onChange={(e) => handle('startDate', e.target.value)} />
          </div>
        </div>

        <div className="ac-form-row">
          {form.format === 'GROUPS' && (
            <div className="ac-form-group">
              <label>Nº de Grupos</label>
              <input type="number" min={1} max={8} value={form.groupCount} onChange={(e) => handle('groupCount', e.target.value)} />
            </div>
          )}
          {form.format !== 'KNOCKOUT' && (
            <div className="ac-form-group">
              <label>{form.format === 'GROUPS' ? 'Avançam por Grupo' : 'Times que Avançam'}</label>
              <input type="number" min={1} max={8} value={form.teamsAdvancing} onChange={(e) => handle('teamsAdvancing', e.target.value)} />
            </div>
          )}
        </div>

        <div className="ac-form-actions">
          <button type="button" className="ac-btn ac-btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="ac-btn ac-btn-primary" disabled={loading}>
            {loading ? <span className="ac-spinner" /> : 'Criar Torneio'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── RESULTADO PARTIDA ────────────────────────────────────────────────────────

function ResultModal({ match, onClose, onSaved }) {
  const isEdit = match.status === 'FINISHED';
  const [homeScore, setHomeScore] = useState(match.homeScore ?? '');
  const [awayScore, setAwayScore] = useState(match.awayScore ?? '');
  const [homePen, setHomePen] = useState(match.homePenalties ?? '');
  const [awayPen, setAwayPen] = useState(match.awayPenalties ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const showPenalties = Number(homeScore) === Number(awayScore) && match.phase !== 'GROUP'
    && homeScore !== '' && awayScore !== '';

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = {
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        ...(showPenalties && homePen !== '' ? { homePenalties: Number(homePen), awayPenalties: Number(awayPen) } : {}),
      };
      const method = isEdit ? 'PATCH' : 'POST';
      await apiFetch(`/admin/championship/matches/${match.id}/result`, { method, body: JSON.stringify(payload) });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={isEdit ? 'Corrigir Resultado' : 'Registrar Resultado'} onClose={onClose}>
      <form className="ac-form" onSubmit={submit}>
        <Alert type="error" message={error} onClose={() => setError('')} />

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <strong style={{ fontSize: '0.85rem', color: 'var(--ac-gray-700)' }}>
            {PHASE_LABELS[match.phase] || match.phase}
          </strong>
        </div>

        <div className="ac-score-input-row">
          <div>
            <p className="ac-score-team-label">{match.homeTeam?.name || 'Casa'}</p>
            <input className="ac-score-input" type="number" min={0} value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)} required placeholder="0" />
          </div>
          <span className="ac-score-x">×</span>
          <div>
            <p className="ac-score-team-label">{match.awayTeam?.name || 'Visitante'}</p>
            <input className="ac-score-input" type="number" min={0} value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)} required placeholder="0" />
          </div>
        </div>

        {showPenalties && (
          <div>
            <p style={{ fontSize: '0.82rem', textAlign: 'center', color: 'var(--ac-warning)', fontWeight: 700, marginBottom: 8 }}>
              ⚠️ Empate no mata-mata — informe os pênaltis
            </p>
            <div className="ac-score-input-row">
              <div>
                <p className="ac-score-team-label">Pên. {match.homeTeam?.name || 'Casa'}</p>
                <input className="ac-score-input" type="number" min={0} value={homePen}
                  onChange={(e) => setHomePen(e.target.value)} placeholder="0" />
              </div>
              <span className="ac-score-x">×</span>
              <div>
                <p className="ac-score-team-label">Pên. {match.awayTeam?.name || 'Visitante'}</p>
                <input className="ac-score-input" type="number" min={0} value={awayPen}
                  onChange={(e) => setAwayPen(e.target.value)} placeholder="0" />
              </div>
            </div>
          </div>
        )}

        <div className="ac-form-actions">
          <button type="button" className="ac-btn ac-btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="ac-btn ac-btn-primary" disabled={loading}>
            {loading ? <span className="ac-spinner" /> : 'Salvar Resultado'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── ABA: TIMES ──────────────────────────────────────────────────────────────

// ─── CACHE DE TIMES (carregado uma vez via TheSportsDB) ──────────────────────
// Endpoint lista todos os times de uma liga com nome + badge URL real
// Sem API key — chave "3" é pública e gratuita para uso com limite

let _teamCache = null; // { serieA: [], serieB: [], selecoes: [] }

async function loadTeamCache() {
  if (_teamCache) return _teamCache;

  const BASE = 'https://www.thesportsdb.com/api/v1/json/3';

  async function fetchLeague(leagueName) {
    try {
      const r = await fetch(`${BASE}/search_all_teams.php?l=${encodeURIComponent(leagueName)}`);
      const d = await r.json();
      return (d.teams || []).map(t => ({
        name:   t.strTeam,
        logo:   t.strTeamBadge ? t.strTeamBadge + '/tiny' : null,
        league: leagueName,
      }));
    } catch { return []; }
  }

  // Série A (ID 4351), Série B (ID 4404), Copa América para seleções
  const [serieA, serieB, copaAm] = await Promise.all([
    fetchLeague('Brazilian Serie A'),
    fetchLeague('Brazilian Serie B'),
    fetchLeague('Copa America'),
  ]);

  _teamCache = { serieA, serieB, selecoes: copaAm };
  return _teamCache;
}

// Normaliza texto: remove acentos e lowercase para comparação
function normalize(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// ─── AUTOCOMPLETE ─────────────────────────────────────────────────────────────

function TeamSearch({ onSelect }) {
  const [query, setQuery]         = useState('');
  const [suggestions, setSugg]    = useState([]);
  const [activeTab, setActiveTab] = useState('clubs');  // 'clubs' | 'selecoes'
  const [loading, setLoading]     = useState(false);
  const [ready, setReady]         = useState(false);

  // Pré-carrega o cache ao montar
  useEffect(() => {
    setLoading(true);
    loadTeamCache().then(() => { setLoading(false); setReady(true); });
  }, []);

  function filter(val, tab) {
    if (!ready || val.trim().length === 0) { setSugg([]); return; }
    const q     = normalize(val.trim());
    const cache = _teamCache;
    const pool  = tab === 'clubs'
      ? [...(cache?.serieA || []), ...(cache?.serieB || [])]
      : (cache?.selecoes || []);
    setSugg(pool.filter(t => normalize(t.name).includes(q)).slice(0, 8));
  }

  function handleInput(e) {
    const val = e.target.value;
    setQuery(val);
    filter(val, activeTab);
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    filter(query, tab);
  }

  function pick(team) {
    onSelect({ name: team.name, logoUrl: team.logo || null });
    setQuery('');
    setSugg([]);
  }

  function createCustom() {
    if (!query.trim()) return;
    onSelect({ name: query.trim(), logoUrl: null }); // null → backend usará escudo padrão
    setQuery('');
    setSugg([]);
  }

  const noResults = ready && query.trim().length > 0 && suggestions.length === 0;

  return (
    <div className="ac-team-search">
      {/* Abas Clubes / Seleções */}
      <div className="ac-team-search-tabs">
        <button
          type="button"
          className={`ac-team-tab ${activeTab === 'clubs' ? 'active' : ''}`}
          onClick={() => handleTabChange('clubs')}
        >
          ⚽ Clubes
        </button>
        <button
          type="button"
          className={`ac-team-tab ${activeTab === 'selecoes' ? 'active' : ''}`}
          onClick={() => handleTabChange('selecoes')}
        >
          🌎 Seleções
        </button>
      </div>

      <div className="ac-team-search-input-wrap">
        <input
          value={query}
          onChange={handleInput}
          placeholder={loading
            ? 'Carregando times...'
            : activeTab === 'clubs'
              ? 'Digite para buscar... (ex: Fla, Pal, Cor)'
              : 'Digite para buscar... (ex: Brasil, Argentina)'
          }
          disabled={loading}
          autoComplete="off"
        />
        {loading && <span className="ac-team-search-spinner" />}
      </div>

      {/* Resultados da busca */}
      {suggestions.length > 0 && (
        <ul className="ac-team-suggestions">
          {suggestions.map((t) => (
            <li key={t.name + t.league} onClick={() => pick(t)}>
              {t.logo
                ? <img src={t.logo} alt={t.name} className="ac-suggestion-logo"
                    onError={e => { e.target.src = defaultBadge; }}
                  />
                : <img src={defaultBadge} alt={t.name} className="ac-suggestion-logo" />
              }
              <div className="ac-suggestion-info">
                <span className="ac-suggestion-name">{t.name}</span>
                <span className="ac-suggestion-league">{t.league}</span>
              </div>
            </li>
          ))}

          {/* Opção de criar no final da lista, se digitou algo */}
          {query.trim() && (
            <li className="ac-suggestion-create" onClick={createCustom}>
              <span className="ac-suggestion-logo-placeholder">➕</span>
              <div className="ac-suggestion-info">
                <span className="ac-suggestion-name">Criar "{query.trim()}"</span>
                <span className="ac-suggestion-league">Time personalizado · escudo padrão</span>
              </div>
            </li>
          )}
        </ul>
      )}

      {/* Nenhum resultado — mostra só o "Criar" */}
      {noResults && (
        <ul className="ac-team-suggestions">
          <li className="ac-suggestion-create" onClick={createCustom}>
            <img src={defaultBadge} alt="Escudo padrão" className="ac-suggestion-logo" />
            <div className="ac-suggestion-info">
              <span className="ac-suggestion-name">Criar "{query.trim()}"</span>
              <span className="ac-suggestion-league">Time não encontrado · será criado com escudo padrão</span>
            </div>
          </li>
        </ul>
      )}
    </div>
  );
}

function TeamsTab({ tournament, onRefresh }) {
  const [teams, setTeams]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]   = useState(null);
  const isDraft = tournament.status === 'DRAFT';

  const loadTeams = useCallback(async () => {
    const data = await apiFetch(`/admin/championship/tournaments/${tournament.id}/teams`);
    setTeams(data || []);
  }, [tournament.id]);

  useEffect(() => { loadTeams(); }, [loadTeams]);

  async function addTeam(team) {
    setLoading(true);
    try {
      await apiFetch(`/admin/championship/tournaments/${tournament.id}/teams`, {
        method: 'POST',
        body: JSON.stringify({ name: team.name, logoUrl: team.logoUrl || null }),
      });
      loadTeams();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally { setLoading(false); }
  }

  async function removeTeam(teamId) {
    if (!window.confirm('Remover este time?')) return;
    try {
      await apiFetch(`/admin/championship/tournaments/${tournament.id}/teams/${teamId}`, { method: 'DELETE' });
      loadTeams();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    }
  }

  return (
    <div>
      <Alert type={alert?.type} message={alert?.msg} onClose={() => setAlert(null)} />

      {isDraft && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--ac-gray-600)', marginBottom: 8 }}>
            Série A, Série B e Seleções — busca com logo automático:
          </p>
          <TeamSearch onSelect={addTeam} />
          {loading && <p style={{ fontSize: '0.8rem', color: 'var(--ac-gray-500)', marginTop: 6 }}>Adicionando...</p>}
        </div>
      )}

      {teams.length === 0 ? (
        <div className="ac-empty">
          <div className="ac-empty-icon">⚽</div>
          <h3>Nenhum time cadastrado</h3>
          <p>Busque e adicione os times que vão participar do torneio.</p>
        </div>
      ) : (
        <div className="ac-teams-grid">
          {teams.map((t) => (
            <div className="ac-team-chip" key={t.id}>
              {t.logoUrl
                ? <img src={t.logoUrl} alt={t.name} className="ac-team-chip-logo" />
                : <span className="ac-team-chip-placeholder">⚽</span>
              }
              <span>{t.name}</span>
              {isDraft && (
                <button onClick={() => removeTeam(t.id)} title="Remover">×</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ABA: GRUPOS ─────────────────────────────────────────────────────────────

function GroupsTab({ tournament, onRefresh }) {
  const [teams, setTeams] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const groupCount = tournament.groupCount || 2;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  useEffect(() => {
    apiFetch(`/admin/championship/tournaments/${tournament.id}/teams`)
      .then((data) => setTeams(data || []));
  }, [tournament.id]);

  function assign(teamId, groupIndex) {
    setAssignments((prev) => ({ ...prev, [teamId]: Number(groupIndex) }));
  }

  async function save() {
    const teamsList = teams.map((t) => ({
      teamId: t.id,
      groupIndex: assignments[t.id] ?? 0,
    }));
    setLoading(true);
    try {
      await apiFetch(`/admin/championship/tournaments/${tournament.id}/assign-groups`, {
        method: 'POST',
        body: JSON.stringify({ assignments: teamsList }),
      });
      setAlert({ type: 'success', msg: 'Grupos salvos com sucesso!' });
      onRefresh();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally { setLoading(false); }
  }

  if (tournament.format !== 'GROUPS') {
    return (
      <div className="ac-empty">
        <div className="ac-empty-icon">📋</div>
        <h3>Grupos não aplicáveis</h3>
        <p>Este torneio usa o formato {FORMAT_LABELS[tournament.format]}.</p>
      </div>
    );
  }

  // Preview: mostra colunas dos grupos
  const groupCols = Array.from({ length: groupCount }, (_, i) => ({
    label: `Grupo ${letters[i]}`,
    teams: teams.filter((t) => (assignments[t.id] ?? 0) === i),
  }));

  return (
    <div>
      <Alert type={alert?.type} message={alert?.msg} onClose={() => setAlert(null)} />

      <p style={{ fontSize: '0.875rem', color: 'var(--ac-gray-700)', marginBottom: 16 }}>
        Atribua cada time a um grupo. O grupo padrão é o A.
      </p>

      <div className="ac-table-wrap" style={{ marginBottom: 20 }}>
        <table className="ac-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Grupo</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t.id}>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {t.logoUrl
                      ? <img src={t.logoUrl} alt={t.name} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                      : <span>⚽</span>
                    }
                    <strong>{t.name}</strong>
                  </span>
                </td>
                <td>
                  <select className="ac-select-sm" value={assignments[t.id] ?? 0}
                    onChange={(e) => assign(t.id, e.target.value)}>
                    {Array.from({ length: groupCount }, (_, i) => (
                      <option key={i} value={i}>Grupo {letters[i]}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ac-assign-grid">
        {groupCols.map((g) => (
          <div className="ac-assign-group-col" key={g.label}>
            <h4>{g.label}</h4>
            {g.teams.length === 0
              ? <span style={{ fontSize: '0.8rem', color: 'var(--ac-gray-500)' }}>Nenhum time</span>
              : g.teams.map((t) => (
                  <div className="ac-assign-team-row" key={t.id}>
                    {t.logoUrl
                      ? <img src={t.logoUrl} alt={t.name} className="ac-assign-team-logo" />
                      : <span>⚽</span>
                    }
                    {t.name}
                  </div>
                ))
            }
          </div>
        ))}
      </div>

      {tournament.status === 'DRAFT' && (
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="ac-btn ac-btn-primary" onClick={save} disabled={loading}>
            {loading ? <span className="ac-spinner" /> : '💾 Salvar Grupos'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── AGENDAMENTO DE PARTIDA ───────────────────────────────────────────────────

function ScheduleModal({ match, onClose, onSaved }) {
  // Converte timestamp ISO para formato datetime-local (YYYY-MM-DDTHH:mm)
  const toLocal = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [value, setValue] = useState(toLocal(match.scheduledAt));
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await apiFetch(`/admin/championship/matches/${match.id}/schedule`, {
        method: 'PATCH',
        // Appenda -03:00 (BRT) para o backend receber a hora correta em UTC
        body: JSON.stringify({ scheduledAt: value ? value + ':00-03:00' : null }),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function clear() {
    setLoading(true); setError('');
    try {
      await apiFetch(`/admin/championship/matches/${match.id}/schedule`, {
        method: 'PATCH',
        body: JSON.stringify({ scheduledAt: null }),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const homeLabel = match.homeTeam?.name || 'A definir';
  const awayLabel = match.awayTeam?.name || 'A definir';

  return (
    <Modal title="📅 Agendar Partida" onClose={onClose}>
      <form className="ac-form" onSubmit={submit}>
        <Alert type="error" message={error} onClose={() => setError('')} />

        <p style={{ textAlign: 'center', fontWeight: 700, marginBottom: 16, color: 'var(--ac-gray-700)' }}>
          {homeLabel} <span style={{ color: 'var(--ac-gray-400)', fontWeight: 400 }}>vs</span> {awayLabel}
        </p>

        <div className="ac-form-group">
          <label>Data e Hora</label>
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <div className="ac-form-actions" style={{ flexWrap: 'wrap', gap: 8 }}>
          {match.scheduledAt && (
            <button
              type="button"
              className="ac-btn ac-btn-ghost"
              onClick={clear}
              disabled={loading}
              style={{ color: 'var(--ac-danger)' }}
            >
              🗑 Remover Data
            </button>
          )}
          <button type="button" className="ac-btn ac-btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="ac-btn ac-btn-primary" disabled={loading}>
            {loading ? <span className="ac-spinner" /> : '💾 Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── ABA: PARTIDAS ────────────────────────────────────────────────────────────

function MatchesTab({ tournament, onRefresh }) {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scheduleMatch, setScheduleMatch] = useState(null);
  const [alert, setAlert] = useState(null);

  const loadMatches = useCallback(async () => {
    const data = await apiFetch(`/admin/championship/tournaments/${tournament.id}/matches`);
    setMatches(data || []);
  }, [tournament.id]);

  useEffect(() => { loadMatches(); }, [loadMatches]);

  const grouped = matches.reduce((acc, m) => {
    const key = PHASE_LABELS[m.phase] || m.phase;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const fmtDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div>
      <Alert type={alert?.type} message={alert?.msg} onClose={() => setAlert(null)} />

      {selectedMatch && (
        <ResultModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSaved={() => { setSelectedMatch(null); loadMatches(); onRefresh(); }}
        />
      )}

      {scheduleMatch && (
        <ScheduleModal
          match={scheduleMatch}
          onClose={() => setScheduleMatch(null)}
          onSaved={() => { setScheduleMatch(null); loadMatches(); }}
        />
      )}

      {matches.length === 0 ? (
        <div className="ac-empty">
          <div className="ac-empty-icon">🗓️</div>
          <h3>Nenhuma partida gerada</h3>
          <p>Inicie o torneio para gerar as partidas automaticamente.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([phase, phaseMatches]) => (
          <div className="ac-group-section" key={phase}>
            <h3>{phase}</h3>
            <div className="ac-matches-list">
              {phaseMatches.map((m) => (
                <div className={`ac-match-card ${m.status === 'FINISHED' ? 'finished' : ''}`} key={m.id}>
                  <span className="ac-match-phase-tag">{PHASE_LABELS[m.phase] || m.phase}</span>

                  <div className="ac-match-teams">
                    <span className="ac-match-team" style={{ textAlign: 'right' }}>
                      {m.homeTeam?.name || <em style={{ color: 'var(--ac-gray-500)' }}>A definir</em>}
                    </span>

                    {m.status === 'FINISHED' ? (
                      <div className="ac-match-score">
                        <span>{m.homeScore}</span>
                        <span className="ac-match-score-divider">×</span>
                        <span>{m.awayScore}</span>
                      </div>
                    ) : (
                      <span className="ac-match-vs">vs</span>
                    )}

                    <span className="ac-match-team">
                      {m.awayTeam?.name || <em style={{ color: 'var(--ac-gray-500)' }}>A definir</em>}
                    </span>
                  </div>

                  {m.homePenalties !== null && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--ac-warning)', fontWeight: 700 }}>
                      Pên: {m.homePenalties}×{m.awayPenalties}
                    </span>
                  )}

                  {/* Data agendada */}
                  {m.scheduledAt ? (
                    <span className="ac-match-date-tag">
                      📅 {fmtDate(m.scheduledAt)}
                    </span>
                  ) : (
                    <span className="ac-match-date-tag ac-match-date-tag--empty">
                      📅 Sem data
                    </span>
                  )}

                  <span className={`ac-match-status-tag ${m.status === 'FINISHED' ? 'finished' : 'scheduled'}`}>
                    {m.status === 'FINISHED' ? '✓ Encerrada' : 'Agendada'}
                  </span>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {/* Botão de data — sempre disponível */}
                    <button
                      className="ac-btn ac-btn-sm ac-btn-ghost"
                      onClick={() => setScheduleMatch(m)}
                    >
                      📅 {m.scheduledAt ? 'Alterar Data' : 'Definir Data'}
                    </button>

                    {/* Botão de resultado — só se times definidos */}
                    {m.homeTeam && m.awayTeam && (
                      <button
                        className="ac-btn ac-btn-sm ac-btn-ghost"
                        onClick={() => setSelectedMatch(m)}
                      >
                        {m.status === 'FINISHED' ? '✏️ Corrigir' : '📝 Resultado'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── ABA: CLASSIFICAÇÃO ───────────────────────────────────────────────────────

function StandingsTab({ tournament }) {
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    apiFetch(`/admin/championship/tournaments/${tournament.id}/standings`)
      .then(setStandings).catch(() => {});
  }, [tournament.id]);

  if (!standings.length) {
    return (
      <div className="ac-empty">
        <div className="ac-empty-icon">📊</div>
        <h3>Classificação indisponível</h3>
        <p>Inicie o torneio e registre resultados para ver a tabela.</p>
      </div>
    );
  }

  return (
    <div>
      {standings.map((g) => (
        <div className="ac-group-section" key={g.group}>
          <h3>{g.group}</h3>
          <div className="ac-table-wrap">
            <table className="ac-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Time</th>
                  <th className="center">J</th>
                  <th className="center">V</th>
                  <th className="center">E</th>
                  <th className="center">D</th>
                  <th className="center">GP</th>
                  <th className="center">GC</th>
                  <th className="center">SG</th>
                  <th className="center bold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {g.standings.map((s) => (
                  <tr key={s.team} className={s.position <= (tournament.teamsAdvancing || 2) ? `ac-standing-pos-${s.position}` : ''}>
                    <td className="bold">{s.position}</td>
                    <td className="bold">
                      {s.position <= (tournament.teamsAdvancing || 2) && <span style={{ color: 'var(--ac-primary)', marginRight: 4 }}>↑</span>}
                      {s.team}
                    </td>
                    <td className="center">{s.played}</td>
                    <td className="center">{s.wins}</td>
                    <td className="center">{s.draws}</td>
                    <td className="center">{s.losses}</td>
                    <td className="center">{s.goalsFor}</td>
                    <td className="center">{s.goalsAgainst}</td>
                    <td className="center">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
                    <td className="center bold" style={{ color: 'var(--ac-primary)' }}>{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--ac-gray-500)', marginTop: 6 }}>
            ↑ Avança para a próxima fase
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── ABA: BRACKET ─────────────────────────────────────────────────────────────

function BracketTab({ tournament }) {
  const [bracket, setBracket] = useState(null);

  useEffect(() => {
    apiFetch(`/admin/championship/tournaments/${tournament.id}/bracket`)
      .then(setBracket).catch(() => {});
  }, [tournament.id]);

  if (!bracket || !bracket.rounds?.length) {
    return (
      <div className="ac-empty">
        <div className="ac-empty-icon">🏆</div>
        <h3>Bracket não disponível</h3>
        <p>O bracket é gerado ao avançar para a fase mata-mata.</p>
      </div>
    );
  }

  return (
    <div className="ac-bracket">
      {bracket.rounds.map((round) => (
        <div className="ac-bracket-round" key={round.phase}>
          <div className="ac-bracket-round-label">{round.label}</div>
          <div className="ac-bracket-matches">
            {round.matches.map((m) => {
              const winnerId = m.winner?.id;
              return (
                <div className="ac-bracket-match" key={m.id}>
                  <div className={`ac-bracket-team ${!m.homeTeam ? 'tbd' : ''} ${winnerId && m.homeTeam?.id === winnerId ? 'winner' : ''}`}>
                    <span>{m.homeTeam?.name || 'A definir'}</span>
                    {m.homeScore !== null && <span className="ac-bracket-team-score">{m.homeScore}</span>}
                  </div>
                  <div className={`ac-bracket-team ${!m.awayTeam ? 'tbd' : ''} ${winnerId && m.awayTeam?.id === winnerId ? 'winner' : ''}`}>
                    <span>{m.awayTeam?.name || 'A definir'}</span>
                    {m.awayScore !== null && <span className="ac-bracket-team-score">{m.awayScore}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ABA: AÇÕES DO TORNEIO ────────────────────────────────────────────────────

function ActionsTab({ tournament, onRefresh }) {
  const [loading, setLoading] = useState('');
  const [alert, setAlert] = useState(null);

  async function doAction(endpoint, label) {
    if (!window.confirm(`Confirmar: ${label}?`)) return;
    setLoading(label); setAlert(null);
    try {
      await apiFetch(`/admin/championship/tournaments/${tournament.id}/${endpoint}`, { method: 'POST' });
      setAlert({ type: 'success', msg: `${label} realizado com sucesso!` });
      onRefresh();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally { setLoading(''); }
  }

  async function setActive() {
    setLoading('active'); setAlert(null);
    try {
      await apiFetch(`/admin/championship/tournaments/${tournament.id}/set-active`, { method: 'PATCH' });
      setAlert({ type: 'success', msg: 'Torneio definido como ativo (visível publicamente)!' });
      onRefresh();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally { setLoading(''); }
  }

  const steps = [
    {
      num: 1,
      label: 'Iniciar Torneio',
      desc: 'Gera todos os jogos da fase inicial automaticamente.',
      action: () => doAction('start', 'Iniciar Torneio'),
      done: tournament.status !== 'DRAFT',
      disabled: tournament.status !== 'DRAFT',
    },
    {
      num: 2,
      label: 'Avançar para Mata-Mata',
      desc: 'Classifica os times e gera o bracket automaticamente.',
      action: () => doAction('advance-to-knockout', 'Avançar para Mata-Mata'),
      done: ['KNOCKOUT_STAGE', 'FINISHED'].includes(tournament.status),
      disabled: tournament.status !== 'GROUP_STAGE',
    },
    {
      num: 3,
      label: 'Tornar Visível ao Público',
      desc: 'Define este torneio como o ativo na página pública.',
      action: setActive,
      done: tournament.active,
      disabled: false,
    },
  ];

  return (
    <div>
      <Alert type={alert?.type} message={alert?.msg} onClose={() => setAlert(null)} />
      <div className="ac-lifecycle">
        {steps.map((s) => (
          <div className="ac-lifecycle-step" key={s.num}>
            <div className={`ac-lifecycle-step-num ${s.done ? 'done' : ''}`}>
              {s.done ? '✓' : s.num}
            </div>
            <div className="ac-lifecycle-step-info">
              <strong>{s.label}</strong>
              <span>{s.desc}</span>
            </div>
            <button
              className={`ac-btn ac-btn-sm ${s.done ? 'ac-btn-ghost' : 'ac-btn-primary'}`}
              onClick={s.action}
              disabled={s.disabled || loading === s.label}
            >
              {loading === s.label ? <span className="ac-spinner" /> : s.done ? '✓ Feito' : 'Executar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DETALHE DO TORNEIO ───────────────────────────────────────────────────────

function TournamentDetail({ tournament, onBack, onRefresh }) {
  const [tab, setTab] = useState('actions');
  const tabs = [
    { key: 'actions',   label: '⚙️ Ações' },
    { key: 'teams',     label: '⚽ Times' },
    { key: 'groups',    label: '📋 Grupos', hide: tournament.format !== 'GROUPS' },
    { key: 'matches',   label: '🗓️ Partidas' },
    { key: 'standings', label: '📊 Classificação' },
    { key: 'bracket',   label: '🏆 Bracket' },
  ].filter((t) => !t.hide);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={onBack}>← Voltar</button>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{tournament.name}</h2>
        <StatusBadge status={tournament.status} />
        {tournament.active && (
          <span className="ac-status ac-status-finished">🟢 Público</span>
        )}
        <span style={{ fontSize: '0.8rem', color: 'var(--ac-gray-700)', marginLeft: 4 }}>
          {FORMAT_LABELS[tournament.format]}
        </span>
      </div>

      <div className="ac-tabs">
        {tabs.map((t) => (
          <button key={t.key} className={`ac-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'actions'   && <ActionsTab   tournament={tournament} onRefresh={onRefresh} />}
      {tab === 'teams'     && <TeamsTab     tournament={tournament} onRefresh={onRefresh} />}
      {tab === 'groups'    && <GroupsTab    tournament={tournament} onRefresh={onRefresh} />}
      {tab === 'matches'   && <MatchesTab   tournament={tournament} onRefresh={onRefresh} />}
      {tab === 'standings' && <StandingsTab tournament={tournament} />}
      {tab === 'bracket'   && <BracketTab   tournament={tournament} />}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function AdminChampionship() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Verifica autenticação admin
  useEffect(() => {
    if (!localStorage.getItem('admin_token')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const loadTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/championship/tournaments');
      setTournaments(data || []);
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTournaments(); }, [loadTournaments]);

  async function refreshSelected() {
    if (!selected) return;
    try {
      const fresh = await apiFetch(`/admin/championship/tournaments/${selected.id}`);
      setSelected(fresh);
      loadTournaments();
    } catch {}
  }

  async function deleteTournament(id, e) {
    e.stopPropagation();
    if (!window.confirm('Excluir este torneio? Esta ação não pode ser desfeita.')) return;
    try {
      await apiFetch(`/admin/championship/tournaments/${id}`, { method: 'DELETE' });
      if (selected?.id === id) setSelected(null);
      loadTournaments();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    }
  }

  return (
    <div className="ac-page">
      {/* HEADER */}
      <div className="ac-header">
        <div className="ac-header-inner">
          <div className="ac-header-title">
            <h1>🏆 Gestão de Campeonatos</h1>
            <span className="ac-badge-admin">Admin</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="ac-btn ac-btn-ghost" onClick={() => navigate('/admin/dashboard')}>
              ← Painel Admin
            </button>
            <button className="ac-btn ac-btn-primary" onClick={() => setShowCreate(true)}>
              + Novo Torneio
            </button>
          </div>
        </div>
      </div>

      <div className="ac-container">
        <Alert type={alert?.type} message={alert?.msg} onClose={() => setAlert(null)} />

        {showCreate && (
          <CreateTournamentModal
            onClose={() => setShowCreate(false)}
            onCreated={(t) => { setShowCreate(false); loadTournaments(); setSelected(t); }}
          />
        )}

        {selected ? (
          <div className="ac-card">
            <div className="ac-card-body">
              <TournamentDetail
                tournament={selected}
                onBack={() => setSelected(null)}
                onRefresh={refreshSelected}
              />
            </div>
          </div>
        ) : (
          <div className="ac-card">
            <div className="ac-card-header">
              <h2>Torneios</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--ac-gray-500)' }}>
                {tournaments.length} torneio{tournaments.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="ac-card-body">
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <span className="ac-spinner dark" />
                </div>
              ) : tournaments.length === 0 ? (
                <div className="ac-empty">
                  <div className="ac-empty-icon">🏆</div>
                  <h3>Nenhum torneio criado</h3>
                  <p>Crie o primeiro torneio para começar a gerenciar os campeonatos.</p>
                  <button className="ac-btn ac-btn-primary" onClick={() => setShowCreate(true)}>
                    + Criar Primeiro Torneio
                  </button>
                </div>
              ) : (
                <div className="ac-tournament-list">
                  {tournaments.map((t) => (
                    <div
                      className={`ac-tournament-item ${selected?.id === t.id ? 'active' : ''}`}
                      key={t.id}
                      onClick={() => setSelected(t)}
                    >
                      <div className="ac-tournament-item-info">
                        <h3>{t.name}</h3>
                        <div className="ac-tournament-item-meta">
                          <StatusBadge status={t.status} />
                          <span>📋 {FORMAT_LABELS[t.format]}</span>
                          {t.active && <span style={{ color: 'var(--ac-primary)', fontWeight: 700 }}>🟢 Público</span>}
                          {t.startDate && <span>📅 {new Date(t.startDate).toLocaleDateString('pt-BR')}</span>}
                        </div>
                      </div>
                      <div className="ac-tournament-item-actions">
                        <button
                          className="ac-btn-icon danger"
                          title="Excluir torneio"
                          onClick={(e) => deleteTournament(t.id, e)}
                        >
                          🗑️
                        </button>
                        <span style={{ fontSize: '0.8rem', color: 'var(--ac-gray-500)' }}>Gerenciar →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
