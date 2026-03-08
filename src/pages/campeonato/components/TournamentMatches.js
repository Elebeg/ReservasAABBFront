import React, { useState, useCallback } from 'react';
import TeamLogo from './TeamLogo';

const API_URL = 'https://reservasaabb-production.up.railway.app';

const PHASE_LABELS = {
  GROUP:         'Fase de Grupos',
  ROUND_OF_16:   'Oitavas de Final',
  QUARTER_FINAL: 'Quartas de Final',
  SEMI_FINAL:    'Semifinal',
  FINAL:         'Final',
};

function formatDateHeader(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  });
}

function formatTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function toDateKey(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ─── Detalhe da partida (gols + cartões + súmula) ────────────────────────────

function MatchDetail({ matchId, homeTeamId, awayTeamId }) {
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded]   = useState(false);
  const [sumulaOpen, setSumulaOpen] = useState(false);

  const load = useCallback(async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/championship/matches/${matchId}/detail`);
      if (res.ok) setDetail(await res.json());
    } catch {}
    finally { setLoading(false); setLoaded(true); }
  }, [matchId, loaded]);

  // Carrega ao montar
  useState(() => { load(); }, []);

  if (loading) return <div className="camp-match-detail-loading">Carregando...</div>;
  if (!detail) return null;

  const homeGoals = detail.goals.filter(g => g.teamId === homeTeamId);
  const awayGoals = detail.goals.filter(g => g.teamId === awayTeamId);
  const homeCards = detail.cards.filter(c => c.teamId === homeTeamId);
  const awayCards = detail.cards.filter(c => c.teamId === awayTeamId);

  const hasEvents = detail.goals.length > 0 || detail.cards.length > 0;

  function goalLabel(g) {
    if (g.ownGoal) return '⚽ Gol Contra';
    const num = g.player?.number ? `${g.player.number}. ` : '';
    return `⚽ ${num}${g.player?.name ?? '—'}`;
  }

  function renderEvents(goals, cards) {
    if (goals.length === 0 && cards.length === 0) {
      return <span className="camp-detail-empty">—</span>;
    }
    return (
      <div className="camp-detail-events">
        {goals.map(g => (
          <span key={g.id} className="camp-detail-event goal">{goalLabel(g)}</span>
        ))}
        {cards.filter(c => c.type === 'YELLOW').map(c => (
          <span key={c.id} className="camp-detail-event yellow">
            🟡 {c.player?.number ? `${c.player.number}. ` : ''}{c.player?.name ?? '—'}
          </span>
        ))}
        {cards.filter(c => c.type === 'RED').map(c => (
          <span key={c.id} className="camp-detail-event red">
            🔴 {c.player?.number ? `${c.player.number}. ` : ''}{c.player?.name ?? '—'}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="camp-match-detail">
      {hasEvents ? (
        <div className="camp-detail-cols">
          <div className="camp-detail-col">{renderEvents(homeGoals, homeCards)}</div>
          <div className="camp-detail-divider" />
          <div className="camp-detail-col right">{renderEvents(awayGoals, awayCards)}</div>
        </div>
      ) : (
        <p className="camp-detail-empty-msg">Nenhum evento registrado.</p>
      )}

      {detail.sumulaUrl && (
        <div className="camp-detail-sumula">
          <button
            className="camp-sumula-btn"
            onClick={() => setSumulaOpen(true)}
          >
            📎 Ver Súmula Digitalizada
          </button>
        </div>
      )}

      {/* Lightbox da súmula */}
      {sumulaOpen && detail.sumulaUrl && (
        <div className="camp-sumula-overlay" onClick={() => setSumulaOpen(false)}>
          <div className="camp-sumula-box" onClick={e => e.stopPropagation()}>
            <button className="camp-sumula-close" onClick={() => setSumulaOpen(false)}>✕</button>
            {detail.sumulaUrl.startsWith('data:application/pdf') || detail.sumulaUrl.endsWith('.pdf') ? (
              <iframe
                src={detail.sumulaUrl}
                title="Súmula"
                style={{ width: '100%', height: '80vh', border: 'none', borderRadius: 6 }}
              />
            ) : (
              <img src={detail.sumulaUrl} alt="Súmula" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 6 }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Match Card ───────────────────────────────────────────────────────────────

function MatchCard({ match, onTeamClick }) {
  const [expanded, setExpanded] = useState(false);
  const finished  = match.status === 'FINISHED';
  const time      = match.scheduledAt ? formatTime(match.scheduledAt) : null;

  function handleTeamClick(team) {
    if (onTeamClick && team) onTeamClick({ name: team.name, logoUrl: team.logoUrl });
  }

  const teamNameClass = onTeamClick ? 'camp-team-clickable' : '';

  return (
    <div className={`camp-match-card ${finished ? 'finished' : ''}`}>
      {time && (
        <div className="camp-match-time">🕐 {time}</div>
      )}

      <div className="camp-match-teams">
        <div className={`camp-match-team home ${finished && match.homeScore > match.awayScore ? 'won' : ''}`}>
          {match.homeTeam
            ? <TeamLogo name={match.homeTeam.name} logoUrl={match.homeTeam.logoUrl} size={28} shape="shield" />
            : <TeamLogo name="?" logoUrl={null} size={28} shape="shield" />
          }
          <span className={`camp-match-team-name${match.homeTeam ? ` ${teamNameClass}` : ''}`} onClick={() => handleTeamClick(match.homeTeam)}>
            {match.homeTeam?.name || <em className="tbd">A definir</em>}
          </span>
        </div>

        <div className="camp-match-center">
          {finished ? (
            <div className="camp-match-score">
              <span className={match.homeScore > match.awayScore ? 'bold' : ''}>{match.homeScore}</span>
              <span className="camp-match-score-sep">×</span>
              <span className={match.awayScore > match.homeScore ? 'bold' : ''}>{match.awayScore}</span>
            </div>
          ) : (
            <span className="camp-match-vs">VS</span>
          )}
          {match.homePenalties != null && (
            <div className="camp-match-penalties">
              ({match.homePenalties} × {match.awayPenalties} pen.)
            </div>
          )}
        </div>

        <div className={`camp-match-team away ${finished && match.awayScore > match.homeScore ? 'won' : ''}`}>
          <span className={`camp-match-team-name${match.awayTeam ? ` ${teamNameClass}` : ''}`} onClick={() => handleTeamClick(match.awayTeam)}>
            {match.awayTeam?.name || <em className="tbd">A definir</em>}
          </span>
          {match.awayTeam
            ? <TeamLogo name={match.awayTeam.name} logoUrl={match.awayTeam.logoUrl} size={28} shape="shield" />
            : <TeamLogo name="?" logoUrl={null} size={28} shape="shield" />
          }
        </div>
      </div>

      <div className="camp-match-footer">
        <span className="camp-match-phase-label">{PHASE_LABELS[match.phase] || match.phase}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {match.hasSumula && !expanded && (
            <span className="camp-sumula-indicator" title="Súmula digitalizada disponível">📎</span>
          )}
          <span className={`camp-match-status ${finished ? 'done' : 'scheduled'}`}>
            {finished ? '✓ Encerrada' : 'Agendada'}
          </span>
          {finished && (
            <button
              className="camp-detail-toggle"
              onClick={() => setExpanded(v => !v)}
              aria-label="Ver detalhes da partida"
            >
              {expanded ? '▲' : '▼'}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <MatchDetail
          matchId={match.id}
          homeTeamId={match.homeTeam?.id}
          awayTeamId={match.awayTeam?.id}
        />
      )}
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function TournamentMatches({ matches, onTeamClick }) {
  const [activeDay, setActiveDay] = useState(null);

  if (!matches || matches.length === 0) {
    return (
      <div className="camp-empty">
        <span className="camp-empty-icon">🗓️</span>
        <p>Nenhuma partida disponível ainda.</p>
      </div>
    );
  }

  const withDate    = matches.filter(m => m.scheduledAt);
  const withoutDate = matches.filter(m => !m.scheduledAt);

  const byDay = {};
  withDate.forEach(m => {
    const key = toDateKey(m.scheduledAt);
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(m);
  });
  const sortedDays = Object.keys(byDay).sort();

  const filteredDays = activeDay ? [activeDay] : sortedDays;

  const phaseOrder = ['GROUP', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL'];
  const byPhase = {};
  withoutDate.forEach(m => {
    if (!byPhase[m.phase]) byPhase[m.phase] = [];
    byPhase[m.phase].push(m);
  });
  const sortedPhases = Object.keys(byPhase).sort(
    (a, b) => phaseOrder.indexOf(a) - phaseOrder.indexOf(b)
  );

  const hasDays = sortedDays.length > 0;

  return (
    <div className="camp-matches">

      {hasDays && (
        <div className="camp-day-filters">
          <button
            className={`camp-day-btn ${!activeDay ? 'active' : ''}`}
            onClick={() => setActiveDay(null)}
          >
            Todos os dias
          </button>
          {sortedDays.map(day => (
            <button
              key={day}
              className={`camp-day-btn ${activeDay === day ? 'active' : ''}`}
              onClick={() => setActiveDay(activeDay === day ? null : day)}
            >
              {new Date(day + 'T00:00:00').toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit',
              })}
            </button>
          ))}
        </div>
      )}

      {filteredDays.map(day => (
        <div className="camp-phase-section" key={day}>
          <h3 className="camp-phase-title camp-phase-title--date">
            📅 {formatDateHeader(day)}
            <span className="camp-day-count">{byDay[day].length} partida{byDay[day].length > 1 ? 's' : ''}</span>
          </h3>
          <div className="camp-matches-grid">
            {byDay[day].map(m => (
              <MatchCard key={m.id} match={m} onTeamClick={onTeamClick} />
            ))}
          </div>
        </div>
      ))}

      {!activeDay && sortedPhases.map(phase => (
        <div className="camp-phase-section" key={phase}>
          <h3 className="camp-phase-title">
            {PHASE_LABELS[phase] || phase}
            <span className="camp-day-count" style={{ opacity: 0.6 }}>Sem data definida</span>
          </h3>
          <div className="camp-matches-grid">
            {byPhase[phase].map(m => (
              <MatchCard key={m.id} match={m} onTeamClick={onTeamClick} />
            ))}
          </div>
        </div>
      ))}

    </div>
  );
}
