import React, { useState, useEffect, useCallback } from 'react';
import defaultBadge from '../../assets/default-team-badge.svg';
import { useNavigate } from 'react-router-dom';
import './AdminChampionship.css';

const API = 'https://reservasaabb-production.up.railway.app';

const DEFAULT_BADGES = [
  '/images/badges/badge-red.svg',
  '/images/badges/badge-blue.svg',
  '/images/badges/badge-green.svg',
  '/images/badges/badge-orange.svg',
  '/images/badges/badge-purple.svg',
  '/images/badges/badge-teal.svg',
  '/images/badges/badge-pink.svg',
  '/images/badges/badge-navy.svg',
];

function getDefaultBadge(teamId) {
  return DEFAULT_BADGES[teamId % DEFAULT_BADGES.length];
}

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

const POSITION_SHORT = {
  GOALKEEPER: 'GOL',
  DEFENDER:   'DEF',
  MIDFIELDER: 'MEI',
  FORWARD:    'ATA',
};

/** Retorna true se o jogador completa ou já completou 40 anos no ano do campeonato */
function isVeteran(player, tournamentYear) {
  if (!player.birthDate) return false;
  return new Date(player.birthDate).getFullYear() <= tournamentYear - 40;
}

/** Extrai o ano do campeonato (usa startDate se disponível, senão createdAt) */
function getTournamentYear(tournament) {
  const ref = tournament.startDate || tournament.createdAt;
  return ref ? new Date(ref).getFullYear() : new Date().getFullYear();
}

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

function ResultModal({ match, tid, tournamentYear = new Date().getFullYear(), onClose, onSaved }) {
  const isEdit = match.status === 'FINISHED';

  const [goals, setGoals]         = useState([]);  // [{ id, teamId, playerId, player? }]
  const [homePen, setHomePen]     = useState(match.homePenalties ?? '');
  const [awayPen, setAwayPen]     = useState(match.awayPenalties ?? '');
  const [cards, setCards]         = useState([]);  // [{ id, teamId, playerId, type, player? }]
  const [goalLoading, setGoalLoading] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [homePending, setHomePending] = useState('');  // playerId selecionado p/ novo gol do time da casa
  const [awayPending, setAwayPending] = useState('');  // playerId selecionado p/ novo gol do visitante

  const homeGoals = goals.filter(g => g.teamId === match.homeTeam?.id);
  const awayGoals = goals.filter(g => g.teamId === match.awayTeam?.id);
  const homeScore = homeGoals.length;
  const awayScore = awayGoals.length;
  const showPenalties = homeScore === awayScore && match.phase !== 'GROUP';

  // Carrega gols, cartões e jogadores ao abrir o modal
  useEffect(() => {
    apiFetch(`/admin/championship/matches/${match.id}/goals`)
      .then(d => setGoals(d || [])).catch(() => {});
    apiFetch(`/admin/championship/matches/${match.id}/cards`)
      .then(d => setCards(d || [])).catch(() => {});
    if (tid && match.homeTeam?.id)
      apiFetch(`/admin/championship/tournaments/${tid}/teams/${match.homeTeam.id}/players`)
        .then(d => setHomePlayers(d || [])).catch(() => {});
    if (tid && match.awayTeam?.id)
      apiFetch(`/admin/championship/tournaments/${tid}/teams/${match.awayTeam.id}/players`)
        .then(d => setAwayPlayers(d || [])).catch(() => {});
  }, [match.id, tid, match.homeTeam?.id, match.awayTeam?.id]);

  // Cada ação persiste imediatamente no banco
  async function addGoal(teamId, playerId, ownGoal = false) {
    if (!ownGoal && !playerId) return;
    setGoalLoading(true);
    try {
      const created = await apiFetch(`/admin/championship/matches/${match.id}/goals`, {
        method: 'POST',
        body: JSON.stringify({ teamId, playerId: playerId ? Number(playerId) : null, ownGoal }),
      });
      setGoals(prev => [...prev, created]);
      // Reseta o select de "novo gol" do time correspondente
      if (teamId === match.homeTeam?.id) setHomePending('');
      else setAwayPending('');
    } catch (err) { setError(err.message); }
    finally { setGoalLoading(false); }
  }

  async function removeGoal(goalId) {
    setGoalLoading(true);
    try {
      await apiFetch(`/admin/championship/matches/${match.id}/goals/${goalId}`, { method: 'DELETE' });
      setGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (err) { setError(err.message); }
    finally { setGoalLoading(false); }
  }

  async function addCard(teamId, playerId, type) {
    setCardLoading(true);
    try {
      const created = await apiFetch(`/admin/championship/matches/${match.id}/cards`, {
        method: 'POST',
        body: JSON.stringify({ teamId, playerId: Number(playerId), type }),
      });
      setCards(prev => [...prev, created]);
    } catch (err) { setError(err.message); }
    finally { setCardLoading(false); }
  }

  async function removeCard(cardId) {
    setCardLoading(true);
    try {
      await apiFetch(`/admin/championship/matches/${match.id}/cards/${cardId}`, { method: 'DELETE' });
      setCards(prev => prev.filter(c => c.id !== cardId));
    } catch (err) { setError(err.message); }
    finally { setCardLoading(false); }
  }

  async function setScorer(goalId, playerId) {
    setGoalLoading(true);
    try {
      const updated = await apiFetch(`/admin/championship/matches/${match.id}/goals/${goalId}`, {
        method: 'PATCH',
        body: JSON.stringify({ playerId: playerId || null }),
      });
      setGoals(prev => prev.map(g => g.id === goalId ? updated : g));
    } catch (err) { setError(err.message); }
    finally { setGoalLoading(false); }
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (showPenalties && homePen === '' && awayPen === '') {
        setError('Informe o resultado dos pênaltis.');
        setSaving(false);
        return;
      }
      if (showPenalties) {
        const hp = Number(homePen || '0');
        const ap = Number(awayPen || '0');
        if (hp === ap) {
          setError('Pênaltis não podem terminar empatados.');
          setSaving(false);
          return;
        }
      }
      const payload = {
        homeScore,
        awayScore,
        ...(showPenalties
          ? { homePenalties: Number(homePen || '0'), awayPenalties: Number(awayPen || '0') }
          : {}),
      };
      const method = isEdit ? 'PATCH' : 'POST';
      await apiFetch(`/admin/championship/matches/${match.id}/result`, { method, body: JSON.stringify(payload) });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally { setSaving(false); }
  }

  async function cancelMatch() {
    if (!window.confirm('Cancelar esta partida? O resultado e os gols da artilharia serão removidos automaticamente.')) return;
    setSaving(true); setError('');
    try {
      await apiFetch(`/admin/championship/matches/${match.id}/result`, { method: 'DELETE' });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally { setSaving(false); }
  }

  const sides = [
    { teamId: match.homeTeam?.id, goals: homeGoals, players: homePlayers, label: match.homeTeam?.name || 'Casa',       pending: homePending, setPending: setHomePending },
    { teamId: match.awayTeam?.id, goals: awayGoals, players: awayPlayers, label: match.awayTeam?.name || 'Visitante', pending: awayPending, setPending: setAwayPending },
  ];

  return (
    <Modal title={isEdit ? 'Corrigir Resultado' : 'Registrar Resultado'} onClose={onClose}>
      <form className="ac-form" onSubmit={submit}>
        <Alert type="error" message={error} onClose={() => setError('')} />

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <strong style={{ fontSize: '0.85rem', color: 'var(--ac-gray-700)' }}>
            {PHASE_LABELS[match.phase] || match.phase}
          </strong>
        </div>

        {/* Placar derivado dos gols */}
        <div className="ac-score-input-row" style={{ marginBottom: 16 }}>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, minWidth: 44, textAlign: 'center' }}>{homeScore}</span>
          <span className="ac-score-x">×</span>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, minWidth: 44, textAlign: 'center' }}>{awayScore}</span>
        </div>

        {/* Listas de gols por time */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
          {sides.map(({ teamId, goals: sideGoals, players, label, pending, setPending }) => (
            <div key={teamId} style={{ flex: 1 }}>
              <p className="ac-score-team-label" style={{ marginBottom: 6 }}>{label}</p>

              {/* Gols já adicionados */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sideGoals.map((g, i) => (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--ac-gray-500)', minWidth: 22 }}>⚽{i + 1}</span>
                    {g.ownGoal
                      ? <span style={{ flex: 1, fontSize: '0.78rem', padding: '3px 5px', color: 'var(--ac-gray-500)', fontStyle: 'italic' }}>Gol Contra</span>
                      : <select
                          value={g.playerId ?? ''}
                          onChange={e => setScorer(g.id, e.target.value)}
                          disabled={goalLoading}
                          style={{ flex: 1, fontSize: '0.78rem', padding: '3px 5px', borderRadius: 4, border: '1px solid var(--ac-gray-300)' }}
                        >
                          <option value="">— Jogador —</option>
                          {players.map(p => (
                            <option key={p.id} value={p.id}>{isVeteran(p, tournamentYear) ? `[V] ${p.name}` : p.name}</option>
                          ))}
                        </select>
                    }
                    <button type="button" className="ac-btn-icon danger"
                      onClick={() => removeGoal(g.id)}
                      disabled={goalLoading}
                      style={{ fontSize: '0.7rem', padding: '2px 5px' }}>×</button>
                  </div>
                ))}
              </div>

              {/* Linha para adicionar novo gol: select jogador + botão */}
              <div style={{ display: 'flex', gap: 5, marginTop: sideGoals.length ? 8 : 0 }}>
                <select
                  value={pending}
                  onChange={e => setPending(e.target.value)}
                  disabled={goalLoading || players.length === 0}
                  style={{ flex: 1, fontSize: '0.78rem', padding: '3px 5px', borderRadius: 4, border: '1px solid var(--ac-gray-300)' }}
                >
                  <option value="">— Quem marcou? —</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{isVeteran(p, tournamentYear) ? `[V] ${p.name}` : p.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="ac-btn ac-btn-sm ac-btn-primary"
                  onClick={() => addGoal(teamId, pending)}
                  disabled={!pending || goalLoading}
                  style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                >
                  + Gol
                </button>
              </div>
              {/* Botão gol contra: adiciona gol ao time sem atribuir a ninguém */}
              <div style={{ marginTop: 4 }}>
                <button
                  type="button"
                  className="ac-btn ac-btn-sm"
                  onClick={() => addGoal(teamId, null, true)}
                  disabled={goalLoading}
                  style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', width: '100%', background: 'var(--ac-gray-100)', color: 'var(--ac-gray-600)', border: '1px dashed var(--ac-gray-400)' }}
                >
                  + Gol Contra
                </button>
              </div>
            </div>
          ))}
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

        {/* ── Cartões ─────────────────────────────────────────────────────── */}
        <div className="ac-cards-section">
          <button
            type="button"
            className="ac-cards-toggle"
            onClick={() => setShowCards(v => !v)}
          >
            <span>Cartões</span>
            <span style={{ fontSize: '0.7rem', marginLeft: 6, opacity: 0.6 }}>{showCards ? '▲' : '▼'}</span>
          </button>

          {showCards && (
            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              {[
                { teamId: match.homeTeam?.id, players: homePlayers, label: match.homeTeam?.name || 'Casa' },
                { teamId: match.awayTeam?.id, players: awayPlayers, label: match.awayTeam?.name || 'Visitante' },
              ].map(({ teamId, players, label }) => {
                const teamCards = cards.filter(c => c.teamId === teamId);
                return (
                  <div key={label} style={{ flex: 1 }}>
                    <p className="ac-score-team-label" style={{ marginBottom: 6 }}>{label}</p>
                    {players.length === 0
                      ? <p style={{ fontSize: '0.75rem', color: 'var(--ac-gray-400)' }}>Sem jogadores cadastrados</p>
                      : players.map(p => {
                          const pYellow = teamCards.filter(c => c.playerId === p.id && c.type === 'YELLOW');
                          const pRed    = teamCards.filter(c => c.playerId === p.id && c.type === 'RED');
                          return (
                            <div key={p.id} className="ac-card-player-row">
                              <span className="ac-card-player-name">
                                {p.number ? `${p.number}. ` : ''}{p.name}
                                {isVeteran(p, tournamentYear) && (
                                  <span style={{ marginLeft: 4, fontSize: '0.65rem', fontWeight: 700, color: '#fff', background: '#7c3aed', borderRadius: 3, padding: '1px 4px', verticalAlign: 'middle' }}>V</span>
                                )}
                              </span>
                              <span className="ac-card-badge yellow">{pYellow.length}</span>
                              <button
                                type="button" className="ac-card-btn yellow"
                                onClick={() => addCard(teamId, p.id, 'YELLOW')}
                                disabled={cardLoading}
                              >+</button>
                              <button
                                type="button" className="ac-card-btn yellow"
                                onClick={() => removeCard(pYellow[pYellow.length - 1]?.id)}
                                disabled={cardLoading || pYellow.length === 0}
                              >−</button>
                              <span className="ac-card-badge red">{pRed.length}</span>
                              <button
                                type="button" className="ac-card-btn red"
                                onClick={() => addCard(teamId, p.id, 'RED')}
                                disabled={cardLoading}
                              >+</button>
                              <button
                                type="button" className="ac-card-btn red"
                                onClick={() => removeCard(pRed[pRed.length - 1]?.id)}
                                disabled={cardLoading || pRed.length === 0}
                              >−</button>
                            </div>
                          );
                        })
                    }
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="ac-form-actions">
          {isEdit && (
            <button type="button" className="ac-btn ac-btn-danger" onClick={cancelMatch} disabled={saving || goalLoading}>
              🚫 Cancelar Partida
            </button>
          )}
          <button type="button" className="ac-btn ac-btn-ghost" onClick={onClose}>Fechar</button>
          <button type="submit" className="ac-btn ac-btn-primary" disabled={saving || goalLoading}>
            {saving ? <span className="ac-spinner" /> : 'Salvar Resultado'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── MODAL SÚMULA ─────────────────────────────────────────────────────────────

function SumulaModal({ match, tournament, onClose }) {
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    async function load() {
      const [hp, ap] = await Promise.all([
        match.homeTeam?.id && tournament?.id
          ? apiFetch(`/admin/championship/tournaments/${tournament.id}/teams/${match.homeTeam.id}/players`).catch(() => [])
          : Promise.resolve([]),
        match.awayTeam?.id && tournament?.id
          ? apiFetch(`/admin/championship/tournaments/${tournament.id}/teams/${match.awayTeam.id}/players`).catch(() => [])
          : Promise.resolve([]),
      ]);
      setHomePlayers(hp || []);
      setAwayPlayers(ap || []);
      setLoading(false);
    }
    load();
  }, [tournament?.id, match.homeTeam?.id, match.awayTeam?.id]);

  function printSumula() {
    const homeName  = match.homeTeam?.name || 'A definir';
    const awayName  = match.awayTeam?.name || 'A definir';
    const phase     = PHASE_LABELS[match.phase] || match.phase || '';
    const tournName = tournament?.name || '';
    const fmtDate   = match.scheduledAt
      ? new Date(match.scheduledAt).toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : '___/___/______  ___h___';

    // caixinha vazia para marcar com X à caneta
    const BOX = `<span style="display:inline-block;width:14px;height:14px;border:1.5px solid #444;margin:0 2px;vertical-align:middle;border-radius:2px"></span>`;

    // 6 caixas para faltas de equipe por tempo + aviso da 7ª
    function teamFoulRow(label) {
      return `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
          <span style="font-size:11px;font-weight:600;min-width:62px">${label}:</span>
          ${Array(6).fill(BOX).join('')}
          <span style="font-size:10px;font-weight:700;margin-left:4px">→ 7ª = TLD</span>
        </div>`;
    }

    // tabela de jogadores: nº · nome · pos · gols · faltas · amarelo · vermelho · assinatura
    const YELLOW_BOX = `<span style="display:inline-block;width:13px;height:17px;border:1.5px solid #444;border-radius:2px;vertical-align:middle"></span>`;
    const RED_BOX    = `<span style="display:inline-block;width:13px;height:17px;border:1.5px solid #444;border-radius:2px;vertical-align:middle"></span>`;

    function playerRows(players) {
      const foulBoxes = Array(5).fill(BOX).join('');
      const numBox    = `<span style="display:inline-block;width:20px;height:14px;border:1.5px solid #444;border-radius:2px;vertical-align:middle"></span>`;
      if (players.length === 0)
        return `<tr><td colspan="6" style="color:#999;font-style:italic;text-align:center;padding:8px">Nenhum jogador cadastrado</td></tr>`;
      const year = getTournamentYear(tournament);
      return players.map(p => {
        const numCell = p.number != null ? p.number : numBox;
        const vetBadge = isVeteran(p, year) ? ' <span style="font-size:9px;font-weight:700;color:#fff;background:#7c3aed;border-radius:3px;padding:1px 4px;vertical-align:middle">V</span>' : '';
        return `<tr>
          <td style="padding:3px 4px;border-bottom:1px solid #eee;text-align:center;width:24px;font-size:11px">${numCell}</td>
          <td style="padding:3px 4px;border-bottom:1px solid #eee;font-size:12px">${p.name}${vetBadge}</td>
          <td style="padding:3px 4px;border-bottom:1px solid #eee;text-align:center;white-space:nowrap">${foulBoxes}</td>
          <td style="padding:3px 4px;border-bottom:1px solid #eee;text-align:center">${YELLOW_BOX}</td>
          <td style="padding:3px 4px;border-bottom:1px solid #eee;text-align:center">${RED_BOX}</td>
          <td style="padding:3px 4px;border-bottom:1px solid #eee;min-width:60px"></td>
        </tr>`;
      }).join('');
    }

    function teamBlock(name, players) {
      return `
        <div>
          <div style="font-size:13px;font-weight:700;text-align:center;padding:5px 8px;background:#eeeeee;border:1px solid #ccc;margin-bottom:8px;border-radius:3px">${name}</div>
          <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#555;margin-bottom:5px">Faltas por tempo da equipe</p>
          ${teamFoulRow('1º Tempo')}
          ${teamFoulRow('2º Tempo')}
          <p style="font-size:10px;color:#aaa;margin-bottom:10px">TLD = Tiro Livre Direto (a partir da 7ª falta no tempo)</p>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#f7f7f7">
                <th style="padding:3px 4px;text-align:center;border-bottom:2px solid #ddd;font-size:9px">Nº</th>
                <th style="padding:3px 4px;text-align:left;border-bottom:2px solid #ddd;font-size:9px">Jogador</th>
                <th style="padding:3px 4px;text-align:center;border-bottom:2px solid #ddd;font-size:9px">Faltas</th>
                <th style="padding:3px 4px;text-align:center;border-bottom:2px solid #ddd;font-size:9px">A</th>
                <th style="padding:3px 4px;text-align:center;border-bottom:2px solid #ddd;font-size:9px">V</th>
                <th style="padding:3px 4px;text-align:center;border-bottom:2px solid #ddd;font-size:9px">Assinatura</th>
              </tr>
            </thead>
            <tbody>${playerRows(players)}</tbody>
          </table>
        </div>`;
    }

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Súmula — ${homeName} × ${awayName}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:13px;color:#222;padding:20px;max-width:820px;margin:0 auto}
  h1{font-size:16px;text-align:center;text-transform:uppercase;letter-spacing:2px;margin-bottom:2px}
  h2{font-size:12px;text-align:center;color:#666;margin-bottom:12px}
  .divider{border:none;border-top:2px solid #222;margin:10px 0}
  .divider-thin{border:none;border-top:1px solid #ccc;margin:8px 0}
  .meta-row{display:flex;gap:20px;font-size:12px;margin-bottom:8px;flex-wrap:wrap}
  .meta-item{display:flex;flex-direction:column;min-width:90px}
  .meta-label{font-size:10px;text-transform:uppercase;color:#888;letter-spacing:0.5px}
  .meta-value{font-weight:bold}
  .score-box{display:flex;justify-content:center;align-items:center;gap:20px;margin:10px 0;padding:10px 16px;border:1px solid #ddd;background:#fafafa;border-radius:4px}
  .team-name{font-size:15px;font-weight:bold;flex:1;text-align:center}
  .score-blank{font-size:28px;font-weight:900;min-width:40px;text-align:center;color:#ccc;border-bottom:2px solid #777;padding:0 10px;letter-spacing:4px}
  .score-sep{font-size:22px;color:#777;font-weight:bold}
  .two-col{display:flex;gap:18px}
  .two-col>div{flex:1;min-width:0}
  .sig-row{display:flex;gap:24px;margin-top:14px}
  .sig-item{flex:1;margin-top:50px;padding-top:5px;text-align:center;font-size:11px;color:#555;border-top:1px solid #444}
  @media print{body{padding:8px}button{display:none}}
</style>
</head>
<body>
<h1>Associação Atlética Banco do Brasil</h1>
<h2>Súmula de Partida — ${tournName}</h2>
<hr class="divider">
<div class="meta-row">
  <div class="meta-item"><span class="meta-label">Fase</span><span class="meta-value">${phase}</span></div>
  <div class="meta-item"><span class="meta-label">Data / Hora</span><span class="meta-value">${fmtDate}</span></div>
  <div class="meta-item"><span class="meta-label">Local</span><span class="meta-value">AABB</span></div>
</div>
<hr class="divider">
<div class="score-box">
  <span class="team-name">${homeName}</span>
  <span class="score-blank">&nbsp;&nbsp;&nbsp;</span>
  <span class="score-sep">×</span>
  <span class="score-blank">&nbsp;&nbsp;&nbsp;</span>
  <span class="team-name">${awayName}</span>
</div>
<div style="border:1.5px solid #aaa;border-radius:4px;padding:10px 14px;margin:10px 0">
  <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Gols por Tempo <span style="font-weight:400;font-style:italic">(nº da camisa e nome)</span></p>
  <table style="width:100%;border-collapse:separate;border-spacing:0 6px;font-size:12px">
    <thead>
      <tr>
        <th style="width:72px"></th>
        <th style="text-align:center;padding:2px 6px;border-bottom:1px solid #bbb;font-size:11px">${homeName}</th>
        <th style="width:22px"></th>
        <th style="text-align:center;padding:2px 6px;border-bottom:1px solid #bbb;font-size:11px">${awayName}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="font-size:11px;font-weight:600;padding:0 3px;vertical-align:middle">1º Tempo</td>
        <td style="border:1px solid #888;height:52px;vertical-align:top;padding:4px;border-radius:2px"></td>
        <td style="text-align:center;font-size:14px;font-weight:bold;vertical-align:middle;padding:0 4px">×</td>
        <td style="border:1px solid #888;height:52px;vertical-align:top;padding:4px;border-radius:2px"></td>
      </tr>
      <tr>
        <td style="font-size:11px;font-weight:600;padding:0 3px;vertical-align:middle">2º Tempo</td>
        <td style="border:1px solid #888;height:52px;vertical-align:top;padding:4px;border-radius:2px"></td>
        <td style="text-align:center;font-size:14px;font-weight:bold;vertical-align:middle;padding:0 4px">×</td>
        <td style="border:1px solid #888;height:52px;vertical-align:top;padding:4px;border-radius:2px"></td>
      </tr>
    </tbody>
  </table>
</div>
<hr class="divider-thin">
<div class="two-col">
  ${teamBlock(homeName, homePlayers)}
  ${teamBlock(awayName, awayPlayers)}
</div>
<hr class="divider" style="margin-top:22px">
<div style="font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;background:#f0f0f0;padding:4px 10px;border-left:3px solid #333;margin-bottom:12px">Assinaturas</div>
<div class="sig-row">
  <div class="sig-item">Árbitro</div>
  <div class="sig-item">Capitão — ${homeName}</div>
  <div class="sig-item">Capitão — ${awayName}</div>
  <div class="sig-item">Responsável AABB</div>
</div>
<p style="text-align:center;font-size:10px;color:#bbb;margin-top:20px">
  Documento gerado em ${new Date().toLocaleString('pt-BR')} — Sistema de Reservas AABB
</p>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=860,height=960');
    if (!w) { window.alert('Permita pop-ups neste site para gerar a súmula.'); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  }

  const homeName = match.homeTeam?.name || 'A definir';
  const awayName = match.awayTeam?.name || 'A definir';

  return (
    <Modal title="📄 Súmula da Partida" onClose={onClose}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}><span className="ac-spinner" /></div>
      ) : (
        <div>
          <div style={{ border: '1px solid var(--ac-gray-200)', borderRadius: 8, padding: 16, marginBottom: 16, background: 'var(--ac-gray-50)' }}>
            <p style={{ textAlign: 'center', fontWeight: 800, fontSize: '0.9rem', marginBottom: 6, color: 'var(--ac-gray-700)' }}>
              {PHASE_LABELS[match.phase] || match.phase} — {tournament?.name}
            </p>
            <p style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 900, margin: '6px 0', color: 'var(--ac-gray-800)' }}>
              {homeName} <span style={{ color: 'var(--ac-gray-300)', fontWeight: 400, fontSize: '1rem' }}>___ × ___</span> {awayName}
            </p>
            <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid var(--ac-gray-200)' }} />
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--ac-gray-500)' }}>
              {homePlayers.length} jogador(es) · {awayPlayers.length} jogador(es)
            </p>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--ac-gray-400)', marginTop: 4 }}>
              Placar, gols, cartões e faltas são preenchidos à mão na folha impressa.
            </p>
          </div>

          <div className="ac-form-actions">
            <button className="ac-btn ac-btn-ghost" onClick={onClose}>Fechar</button>
            <button className="ac-btn ac-btn-primary" onClick={printSumula}>
              🖨️ Imprimir / Salvar PDF
            </button>
          </div>
        </div>
      )}
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

// ─── EDITAR LOGO DO TIME ──────────────────────────────────────────────────────

function EditTeamLogoModal({ team, tournamentId, onClose, onSaved }) {
  const [urlInput, setUrlInput] = useState(team.logoUrl?.startsWith('data:') ? '' : (team.logoUrl || ''));
  const [selected, setSelected] = useState(null);
  const [filePreview, setFilePreview] = useState(team.logoUrl?.startsWith('data:') ? team.logoUrl : null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const fileRef = React.useRef();

  const previewSrc = filePreview ?? selected ?? (urlInput.trim() || null) ?? getDefaultBadge(team.id);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Arquivo muito grande (máx 5 MB).'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const MAX = 200;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/png');
        setFilePreview(compressed);
        setUrlInput('');
        setSelected(null);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    setSaving(true); setError('');
    try {
      const logoUrl = filePreview ?? (selected !== null ? selected : (urlInput.trim() || null));
      const updated = await apiFetch(
        `/admin/championship/tournaments/${tournamentId}/teams/${team.id}/logo`,
        { method: 'PATCH', body: JSON.stringify({ logoUrl }) },
      );
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally { setSaving(false); }
  }

  return (
    <Modal title={`Logo — ${team.name}`} onClose={onClose}>
      <div>
        <Alert type="error" message={error} onClose={() => setError('')} />

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img
            src={previewSrc}
            alt="Preview"
            style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--ac-gray-200)' }}
            onError={e => { e.target.src = defaultBadge; }}
          />
        </div>

        {/* Upload de arquivo local */}
        <div className="ac-form-group">
          <label>Importar arquivo (PNG, JPG, SVG — máx 2 MB)</label>
          <div className="ac-file-upload-row">
            <button
              type="button"
              className="ac-btn ac-btn-ghost"
              style={{ fontSize: '0.8rem' }}
              onClick={() => fileRef.current.click()}
            >
              Escolher arquivo...
            </button>
            {filePreview && (
              <button
                type="button"
                className="ac-btn ac-btn-ghost"
                style={{ fontSize: '0.8rem', color: 'var(--ac-danger)' }}
                onClick={() => { setFilePreview(null); fileRef.current.value = ''; }}
              >
                Remover
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
        </div>

        <div className="ac-logo-source-divider">ou</div>

        <div className="ac-form-group">
          <label>URL da logo</label>
          <input
            value={urlInput}
            onChange={e => { setUrlInput(e.target.value); setSelected(null); setFilePreview(null); if (fileRef.current) fileRef.current.value = ''; }}
            placeholder="https://..."
          />
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--ac-gray-600)', margin: '12px 0 8px' }}>
          Ou escolha um escudo padrão:
        </p>
        <div className="ac-badge-picker">
          {DEFAULT_BADGES.map(b => (
            <button
              key={b}
              type="button"
              className={`ac-badge-option ${selected === b ? 'selected' : ''}`}
              onClick={() => { setSelected(b); setUrlInput(''); setFilePreview(null); if (fileRef.current) fileRef.current.value = ''; }}
            >
              <img src={b} alt="escudo" />
            </button>
          ))}
          <button
            type="button"
            className={`ac-badge-option ${selected === null && !urlInput.trim() && !filePreview ? 'selected' : ''}`}
            onClick={() => { setSelected(null); setUrlInput(''); setFilePreview(null); if (fileRef.current) fileRef.current.value = ''; }}
            title="Sem logo (usa padrão automático)"
          >
            <img src={defaultBadge} alt="padrão" />
          </button>
        </div>

        <div className="ac-form-actions">
          <button type="button" className="ac-btn ac-btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="button" className="ac-btn ac-btn-primary" onClick={save} disabled={saving}>
            {saving ? <span className="ac-spinner" /> : 'Salvar Logo'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function TeamsTab({ tournament, onRefresh }) {
  const [teams, setTeams]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [alert, setAlert]       = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
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
              <img
                src={t.logoUrl || getDefaultBadge(t.id)}
                alt={t.name}
                className="ac-team-chip-logo"
                onError={e => { e.target.src = defaultBadge; }}
              />
              <span>{t.name}</span>
              <button
                className="ac-team-chip-edit"
                onClick={() => setEditingTeam(t)}
                title="Editar logo"
              >✎</button>
              {isDraft && (
                <button onClick={() => removeTeam(t.id)} title="Remover">×</button>
              )}
            </div>
          ))}
        </div>
      )}

      {editingTeam && (
        <EditTeamLogoModal
          team={editingTeam}
          tournamentId={tournament.id}
          onClose={() => setEditingTeam(null)}
          onSaved={() => { setEditingTeam(null); loadTeams(); }}
        />
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

// ─── MODAL UPLOAD SÚMULA ──────────────────────────────────────────────────────

function SumulaUploadModal({ match, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [preview, setPreview] = useState(null);  // base64 ou URL já existente
  const hasCurrent = !!match.sumulaUrl;

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function save() {
    if (!preview) return;
    setLoading(true); setError('');
    try {
      await apiFetch(`/admin/championship/matches/${match.id}/sumula`, {
        method: 'PATCH',
        body: JSON.stringify({ sumulaUrl: preview }),
      });
      onSaved();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function remove() {
    if (!window.confirm('Remover a súmula digitalizada desta partida?')) return;
    setLoading(true); setError('');
    try {
      await apiFetch(`/admin/championship/matches/${match.id}/sumula`, {
        method: 'PATCH',
        body: JSON.stringify({ sumulaUrl: null }),
      });
      onSaved();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const isImage = preview?.startsWith('data:image') || (!preview && match.sumulaUrl?.startsWith('data:image'));
  const isPdf   = preview?.startsWith('data:application/pdf') || (!preview && match.sumulaUrl?.startsWith('data:application/pdf'));

  return (
    <Modal title="📎 Súmula Digitalizada" onClose={onClose}>
      <Alert type="error" message={error} onClose={() => setError('')} />

      {hasCurrent && !preview && (
        <div style={{ marginBottom: 14, padding: '10px 14px', background: 'var(--ac-gray-100)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--ac-gray-700)', flex: 1 }}>
            {match.sumulaUrl?.startsWith('data:image') ? '🖼️ Imagem já enviada' : '📄 PDF já enviado'}
          </span>
          <a
            href={match.sumulaUrl} target="_blank" rel="noreferrer"
            className="ac-btn ac-btn-sm ac-btn-ghost"
            style={{ fontSize: '0.75rem' }}
          >Visualizar</a>
          <button className="ac-btn ac-btn-sm" onClick={remove} disabled={loading}
            style={{ fontSize: '0.75rem', color: 'var(--ac-danger)' }}>🗑 Remover</button>
        </div>
      )}

      <div className="ac-form-group">
        <label>Selecionar arquivo (PDF ou imagem)</label>
        <input type="file" accept="application/pdf,image/*" onChange={handleFile}
          style={{ fontSize: '0.85rem' }} />
      </div>

      {preview && (
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          {isImage && <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 6, border: '1px solid var(--ac-gray-200)' }} />}
          {isPdf   && <p style={{ fontSize: '0.82rem', color: 'var(--ac-gray-600)' }}>📄 PDF selecionado — clique em Salvar para enviar.</p>}
        </div>
      )}

      <div className="ac-form-actions">
        <button className="ac-btn ac-btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="ac-btn ac-btn-primary" onClick={save} disabled={!preview || loading}>
          {loading ? <span className="ac-spinner" /> : '💾 Salvar Súmula'}
        </button>
      </div>
    </Modal>
  );
}

// ─── ABA: PARTIDAS ────────────────────────────────────────────────────────────

function MatchesTab({ tournament, onRefresh }) {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scheduleMatch, setScheduleMatch] = useState(null);
  const [sumulaMatch, setSumulaMatch]     = useState(null);
  const [uploadSumulaMatch, setUploadSumulaMatch] = useState(null);
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
          tid={tournament.id}
          tournamentYear={getTournamentYear(tournament)}
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

      {sumulaMatch && (
        <SumulaModal
          match={sumulaMatch}
          tournament={tournament}
          onClose={() => setSumulaMatch(null)}
        />
      )}

      {uploadSumulaMatch && (
        <SumulaUploadModal
          match={uploadSumulaMatch}
          onClose={() => setUploadSumulaMatch(null)}
          onSaved={() => { setUploadSumulaMatch(null); loadMatches(); }}
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

                    {/* Botão de súmula — só se times definidos */}
                    {m.homeTeam && m.awayTeam && (
                      <button
                        className="ac-btn ac-btn-sm ac-btn-ghost"
                        onClick={() => setSumulaMatch(m)}
                      >
                        📄 Súmula
                      </button>
                    )}

                    {/* Botão de upload de súmula digitalizada */}
                    {m.homeTeam && m.awayTeam && (
                      <button
                        className="ac-btn ac-btn-sm ac-btn-ghost"
                        onClick={() => setUploadSumulaMatch(m)}
                        title="Enviar súmula digitalizada (foto/PDF)"
                        style={m.hasSumula ? { borderColor: 'var(--ac-primary)', color: 'var(--ac-primary)' } : {}}
                      >
                        {m.hasSumula ? '📎 Súmula ✓' : '📎 Enviar Súmula'}
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
                  <th className="center" title="Cartões Amarelos">🟡</th>
                  <th className="center" title="Cartões Vermelhos">🔴</th>
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
                    <td className="center" style={{ color: s.yellowCards > 0 ? '#d68910' : undefined }}>{s.yellowCards ?? 0}</td>
                    <td className="center" style={{ color: s.redCards > 0 ? '#c0392b' : undefined }}>{s.redCards ?? 0}</td>
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

// ─── ABA: JOGADORES ───────────────────────────────────────────────────────────

function PlayersTab({ tournament }) {
  const [view, setView]                 = useState('manage');
  const [teams, setTeams]               = useState([]);
  const [selectedTeamId, setTeamId]     = useState(null);
  const [teamPlayers, setTeamPlayers]   = useState([]);
  const [allPlayers, setAllPlayers]     = useState([]);
  const [addForm, setAddForm]           = useState({ name: '', number: '', position: '' });
  const [bulkText, setBulkText]         = useState('');
  const [showBulk, setShowBulk]         = useState(false);
  const [alert, setAlert]               = useState(null);
  const [saving, setSaving]             = useState(false);
  const tid = tournament.id;

  const loadAllPlayers = useCallback(async () => {
    try {
      const d = await apiFetch(`/admin/championship/tournaments/${tid}/players`);
      setAllPlayers(d || []);
    } catch {}
  }, [tid]);

  const loadTeamPlayers = useCallback(async () => {
    if (!selectedTeamId) { setTeamPlayers([]); return; }
    try {
      const d = await apiFetch(`/admin/championship/tournaments/${tid}/teams/${selectedTeamId}/players`);
      setTeamPlayers(d || []);
    } catch {}
  }, [tid, selectedTeamId]);

  useEffect(() => {
    apiFetch(`/admin/championship/tournaments/${tid}/teams`).then(d => setTeams(d || []));
    loadAllPlayers();
  }, [tid, loadAllPlayers]);

  useEffect(() => { loadTeamPlayers(); }, [loadTeamPlayers]);

  async function addPlayer(e) {
    e.preventDefault();
    if (!selectedTeamId) return;
    setSaving(true); setAlert(null);
    try {
      await apiFetch(`/admin/championship/tournaments/${tid}/teams/${selectedTeamId}/players`, {
        method: 'POST',
        body: JSON.stringify({
          name:     addForm.name,
          number:   addForm.number ? Number(addForm.number) : undefined,
          position: addForm.position || undefined,
        }),
      });
      setAddForm({ name: '', number: '', position: '' });
      loadTeamPlayers(); loadAllPlayers();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally { setSaving(false); }
  }

  async function removePlayer(playerId) {
    if (!window.confirm('Remover este jogador?')) return;
    try {
      await apiFetch(`/admin/championship/players/${playerId}`, { method: 'DELETE' });
      loadTeamPlayers(); loadAllPlayers();
    } catch (err) { setAlert({ type: 'error', msg: err.message }); }
  }

  async function incrStat(playerId, stat, delta) {
    try {
      await apiFetch(`/admin/championship/players/${playerId}/stat/${stat}/increment`, {
        method: 'PATCH',
        body: JSON.stringify({ delta }),
      });
      loadTeamPlayers(); loadAllPlayers();
    } catch (err) { setAlert({ type: 'error', msg: err.message }); }
  }

  async function updatePosition(playerId, position) {
    try {
      await apiFetch(`/admin/championship/players/${playerId}`, {
        method: 'PATCH',
        body: JSON.stringify({ position: position || null }),
      });
      loadTeamPlayers(); loadAllPlayers();
    } catch (err) { setAlert({ type: 'error', msg: err.message }); }
  }

  async function updateNumber(playerId, value) {
    const number = value === '' ? null : Number(value);
    if (value !== '' && (isNaN(number) || number < 1 || number > 99)) return;
    try {
      await apiFetch(`/admin/championship/players/${playerId}`, {
        method: 'PATCH',
        body: JSON.stringify({ number }),
      });
      loadTeamPlayers(); loadAllPlayers();
    } catch (err) { setAlert({ type: 'error', msg: err.message }); }
  }

  async function updateBirthDate(playerId, value) {
    try {
      await apiFetch(`/admin/championship/players/${playerId}`, {
        method: 'PATCH',
        body: JSON.stringify({ birthDate: value || null }),
      });
      loadTeamPlayers(); loadAllPlayers();
    } catch (err) { setAlert({ type: 'error', msg: err.message }); }
  }

  async function doBulkImport() {
    if (!selectedTeamId || !bulkText.trim()) return;
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    setSaving(true); setAlert(null);
    try {
      await apiFetch(`/admin/championship/tournaments/${tid}/teams/${selectedTeamId}/players/import-lines`, {
        method: 'POST',
        body: JSON.stringify({ lines }),
      });
      setBulkText(''); setShowBulk(false);
      setAlert({ type: 'success', msg: `${lines.length} jogador(es) importado(s) com sucesso!` });
      loadTeamPlayers(); loadAllPlayers();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally { setSaving(false); }
  }

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  /* helper: stat increment control */
  function StatCtrl({ value, onMinus, onPlus, minusDisabled }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
        <button className="ac-btn-icon" style={{ fontSize: '0.7rem', padding: '2px 6px' }}
          onClick={onMinus} disabled={minusDisabled}>−</button>
        <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700 }}>{value}</span>
        <button className="ac-btn-icon" style={{ fontSize: '0.7rem', padding: '2px 6px' }}
          onClick={onPlus}>+</button>
      </div>
    );
  }

  return (
    <div>
      <Alert type={alert?.type} message={alert?.msg} onClose={() => setAlert(null)} />

      {/* Subview toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`ac-btn ac-btn-sm ${view === 'manage' ? 'ac-btn-primary' : 'ac-btn-ghost'}`}
          onClick={() => setView('manage')}>👤 Gerenciar Elencos</button>
        <button className={`ac-btn ac-btn-sm ${view === 'ranking' ? 'ac-btn-primary' : 'ac-btn-ghost'}`}
          onClick={() => { setView('ranking'); loadAllPlayers(); }}>⚽ Artilharia & Cartões</button>
      </div>

      {/* ── GERENCIAR ELENCOS ── */}
      {view === 'manage' && (
        <div>
          {/* Team selector */}
          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ac-gray-700)', marginBottom: 8 }}>
            Selecione um time para gerenciar seu elenco:
          </p>
          <div className="ac-teams-grid" style={{ marginBottom: 20 }}>
            {teams.length === 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--ac-gray-500)' }}>Nenhum time cadastrado.</span>
            )}
            {teams.map(t => (
              <div key={t.id} className="ac-team-chip"
                style={{ cursor: 'pointer',
                  borderColor: selectedTeamId === t.id ? 'var(--ac-primary)' : undefined,
                  background:  selectedTeamId === t.id ? 'var(--ac-primary-light)' : undefined,
                }}
                onClick={() => setTeamId(t.id)}
              >
                {t.logoUrl
                  ? <img src={t.logoUrl} alt={t.name} className="ac-team-chip-logo" onError={e => { e.target.src = defaultBadge; }} />
                  : <span className="ac-team-chip-placeholder">⚽</span>
                }
                <span>{t.name}</span>
              </div>
            ))}
          </div>

          {selectedTeam && (
            <div className="ac-card">
              <div className="ac-card-header">
                <h2>
                  {selectedTeam.logoUrl && (
                    <img src={selectedTeam.logoUrl} alt={selectedTeam.name}
                      style={{ width: 24, height: 24, objectFit: 'contain', marginRight: 8, verticalAlign: 'middle' }}
                      onError={e => { e.target.src = defaultBadge; }}
                    />
                  )}
                  {selectedTeam.name}
                  <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--ac-gray-500)', marginLeft: 8 }}>
                    {teamPlayers.length} jogador(es)
                  </span>
                </h2>
                <button className="ac-btn ac-btn-sm ac-btn-ghost" onClick={() => setShowBulk(v => !v)}>
                  {showBulk ? '✕ Fechar Import' : '📋 Importar em Lote'}
                </button>
              </div>
              <div className="ac-card-body">

                {/* Bulk import */}
                {showBulk && (
                  <div style={{ background: 'var(--ac-gray-100)', border: '1px solid var(--ac-gray-200)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--ac-gray-700)', marginBottom: 8 }}>
                      Uma linha por jogador: <strong>Nome;Número;Posição</strong><br />
                      Posições: <code>GK</code> · <code>DEF</code> · <code>MID</code> · <code>FWD</code> (Número e Posição são opcionais)<br />
                      <span style={{ color: 'var(--ac-danger)', fontWeight: 600 }}>⚠️ Substitui todo o elenco atual do time.</span>
                    </p>
                    <textarea
                      value={bulkText}
                      onChange={e => setBulkText(e.target.value)}
                      placeholder={"Pelé;10;FWD\nTaffarel;1;GK\nSó o Nome"}
                      style={{ width: '100%', minHeight: 110, padding: '10px 12px', border: '1.5px solid var(--ac-gray-300)', borderRadius: 6, fontFamily: 'monospace', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
                      <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={() => setShowBulk(false)}>Cancelar</button>
                      <button className="ac-btn ac-btn-primary ac-btn-sm" onClick={doBulkImport} disabled={saving || !bulkText.trim()}>
                        {saving ? <span className="ac-spinner" /> : '📥 Importar'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Add player inline form */}
                <form onSubmit={addPlayer} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div className="ac-form-group" style={{ flex: 2, minWidth: 140 }}>
                    <label>Nome *</label>
                    <input value={addForm.name}
                      onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                      required placeholder="Nome do jogador" />
                  </div>
                  <div className="ac-form-group" style={{ width: 130 }}>
                    <label>Posição</label>
                    <select value={addForm.position}
                      onChange={e => setAddForm(f => ({ ...f, position: e.target.value }))}>
                      <option value="">—</option>
                      <option value="GOALKEEPER">Goleiro</option>
                      <option value="DEFENDER">Defensor</option>
                      <option value="MIDFIELDER">Meio-campo</option>
                      <option value="FORWARD">Atacante</option>
                    </select>
                  </div>
                  <button type="submit" className="ac-btn ac-btn-primary ac-btn-sm" disabled={saving} style={{ height: 38 }}>
                    {saving ? <span className="ac-spinner" /> : '+ Adicionar'}
                  </button>
                </form>

                {/* Players table */}
                {teamPlayers.length === 0 ? (
                  <div className="ac-empty" style={{ padding: 24 }}>
                    <div className="ac-empty-icon">👤</div>
                    <p>Nenhum jogador cadastrado. Use o formulário acima ou importe em lote.</p>
                  </div>
                ) : (
                  <div className="ac-table-wrap">
                    <table className="ac-table">
                      <thead>
                        <tr>
                          <th className="center">#</th>
                          <th>Nome</th>
                          <th className="center">Pos.</th>
                          <th className="center">Nascimento</th>
                          <th className="center" title="Gols">⚽ Gols</th>
                          <th className="center" title="Cartões Amarelos">🟡 Amarelos</th>
                          <th className="center" title="Cartões Vermelhos">🔴 Vermelhos</th>
                          <th className="center"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamPlayers.map(p => (
                          <tr key={p.id}>
                            <td className="center">
                              <input
                                type="number" min={1} max={99}
                                defaultValue={p.number ?? ''}
                                placeholder="—"
                                onBlur={e => updateNumber(p.id, e.target.value)}
                                style={{ width: 48, fontSize: '0.75rem', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--ac-gray-300)', background: 'var(--ac-gray-100)', textAlign: 'center' }}
                              />
                            </td>
                            <td style={{ fontWeight: 600 }}>
                              {p.name}
                              {isVeteran(p, getTournamentYear(tournament)) && (
                                <span style={{ marginLeft: 5, fontSize: '0.65rem', fontWeight: 700, color: '#fff', background: '#7c3aed', borderRadius: 3, padding: '1px 5px' }}>VET</span>
                              )}
                            </td>
                            <td className="center">
                              <select
                                value={p.position || ''}
                                onChange={e => updatePosition(p.id, e.target.value)}
                                style={{ fontSize: '0.75rem', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--ac-gray-300)', background: 'var(--ac-gray-100)', cursor: 'pointer' }}
                              >
                                <option value="">—</option>
                                <option value="GOALKEEPER">GOL</option>
                                <option value="DEFENDER">DEF</option>
                                <option value="MIDFIELDER">MEI</option>
                                <option value="FORWARD">ATA</option>
                              </select>
                            </td>
                            <td className="center">
                              <input
                                type="date"
                                defaultValue={p.birthDate ? p.birthDate.substring(0, 10) : ''}
                                onBlur={e => updateBirthDate(p.id, e.target.value)}
                                style={{ fontSize: '0.72rem', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--ac-gray-300)', background: 'var(--ac-gray-100)' }}
                              />
                            </td>
                            <td className="center">
                              <StatCtrl value={p.goals} minusDisabled={p.goals === 0}
                                onMinus={() => incrStat(p.id, 'goals', -1)}
                                onPlus={() => incrStat(p.id, 'goals', 1)} />
                            </td>
                            <td className="center">
                              <StatCtrl value={p.yellowCards} minusDisabled={p.yellowCards === 0}
                                onMinus={() => incrStat(p.id, 'yellowCards', -1)}
                                onPlus={() => incrStat(p.id, 'yellowCards', 1)} />
                            </td>
                            <td className="center">
                              <StatCtrl value={p.redCards} minusDisabled={p.redCards === 0}
                                onMinus={() => incrStat(p.id, 'redCards', -1)}
                                onPlus={() => incrStat(p.id, 'redCards', 1)} />
                            </td>
                            <td className="center">
                              <button className="ac-btn-icon danger" title="Remover jogador"
                                onClick={() => removePlayer(p.id)}>🗑</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ARTILHARIA & CARTÕES ── */}
      {view === 'ranking' && (
        <div>
          {allPlayers.length === 0 ? (
            <div className="ac-empty">
              <div className="ac-empty-icon">⚽</div>
              <h3>Nenhum jogador cadastrado</h3>
              <p>Adicione jogadores aos times para ver os rankings.</p>
            </div>
          ) : (
            <>
              {/* Artilharia */}
              <div className="ac-group-section" style={{ marginBottom: 28 }}>
                <h3>⚽ Artilharia</h3>
                <div className="ac-table-wrap">
                  <table className="ac-table">
                    <thead>
                      <tr>
                        <th className="center">#</th>
                        <th>Jogador</th>
                        <th>Time</th>
                        <th className="center">Pos.</th>
                        <th className="center bold">Gols</th>
                        <th className="center">🟡</th>
                        <th className="center">🔴</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...allPlayers]
                        .sort((a, b) => b.goals - a.goals || a.yellowCards - b.yellowCards || a.name.localeCompare(b.name))
                        .map((p, i) => (
                          <tr key={p.id}>
                            <td className="center bold">{i + 1}</td>
                            <td style={{ fontWeight: 600 }}>
                              {p.name}
                              {isVeteran(p, getTournamentYear(tournament)) && (
                                <span style={{ marginLeft: 5, fontSize: '0.65rem', fontWeight: 700, color: '#fff', background: '#7c3aed', borderRadius: 3, padding: '1px 5px' }}>VET</span>
                              )}
                            </td>
                            <td style={{ fontSize: '0.875rem', color: 'var(--ac-gray-700)' }}>
                              {p.team?.name ?? '—'}
                            </td>
                            <td className="center">
                              {p.position ? (
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'var(--ac-gray-200)', color: 'var(--ac-gray-700)' }}>
                                  {POSITION_SHORT[p.position] || p.position}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="center bold" style={{ color: 'var(--ac-primary)', fontSize: '1rem' }}>{p.goals}</td>
                            <td className="center">{p.yellowCards || '—'}</td>
                            <td className="center">{p.redCards || '—'}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ranking disciplinar */}
              {allPlayers.some(p => p.yellowCards > 0 || p.redCards > 0) && (
                <div className="ac-group-section">
                  <h3>🟡 Ranking Disciplinar</h3>
                  <div className="ac-table-wrap">
                    <table className="ac-table">
                      <thead>
                        <tr>
                          <th>Jogador</th>
                          <th>Time</th>
                          <th className="center">🟡 Amarelos</th>
                          <th className="center">🔴 Vermelhos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...allPlayers]
                          .filter(p => p.yellowCards > 0 || p.redCards > 0)
                          .sort((a, b) => b.redCards - a.redCards || b.yellowCards - a.yellowCards)
                          .map(p => (
                            <tr key={p.id}>
                              <td style={{ fontWeight: 600 }}>
                                {p.name}
                                {isVeteran(p, getTournamentYear(tournament)) && (
                                  <span style={{ marginLeft: 5, fontSize: '0.65rem', fontWeight: 700, color: '#fff', background: '#7c3aed', borderRadius: 3, padding: '1px 5px' }}>VET</span>
                                )}
                              </td>
                              <td style={{ fontSize: '0.875rem', color: 'var(--ac-gray-700)' }}>{p.team?.name ?? '—'}</td>
                              <td className="center">
                                {p.yellowCards > 0
                                  ? <span style={{ color: '#d68910', fontWeight: 700 }}>{p.yellowCards}</span>
                                  : '—'
                                }
                              </td>
                              <td className="center">
                                {p.redCards > 0
                                  ? <span style={{ color: '#c0392b', fontWeight: 700 }}>{p.redCards}</span>
                                  : '—'
                                }
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
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
    { key: 'players',   label: '👤 Jogadores' },
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
      {tab === 'players'   && <PlayersTab   tournament={tournament} />}
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
