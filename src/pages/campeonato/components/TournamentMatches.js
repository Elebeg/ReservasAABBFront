import { useState, useEffect } from 'react';
import TeamLogo from './TeamLogo';

const API_URL = 'https://reservasaabb-production.up.railway.app';

function isVet(player, year) {
  if (!player?.birthDate) return false;
  return new Date(player.birthDate).getFullYear() <= year - 40;
}

const VetBadge = () => (
  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#fff', background: '#7c3aed', borderRadius: 3, padding: '1px 4px', verticalAlign: 'middle', marginLeft: 4 }}>VET</span>
);

const PHASE_LABELS = {
  GROUP:         'Fase de Grupos',
  ROUND_OF_16:   'Oitavas de Final',
  QUARTER_FINAL: 'Quartas de Final',
  SEMI_FINAL:    'Semifinal',
  FINAL:         'Final',
};

function formatDateHeader(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

function formatTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function toDateKey(iso) {
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ─── Modal de relatório de jogo ───────────────────────────────────────────────

function MatchReportModal({ match, tournamentYear, onClose }) {
  const [detail, setDetail]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [sumulaOpen, setSumulaOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/championship/matches/${match.id}/detail`);
        if (res.ok) setDetail(await res.json());
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, [match.id]);


  const homeWon = match.homeScore > match.awayScore;
  const awayWon = match.awayScore > match.homeScore;
  const homeName = match.homeTeam?.name || 'Casa';
  const awayName = match.awayTeam?.name || 'Visitante';

  // Filtra eventos por time
  const homeGoals = detail?.goals.filter(g => g.teamId === match.homeTeam?.id) ?? [];
  const awayGoals = detail?.goals.filter(g => g.teamId === match.awayTeam?.id) ?? [];
  const homeCards = detail?.cards.filter(c => c.teamId === match.homeTeam?.id) ?? [];
  const awayCards = detail?.cards.filter(c => c.teamId === match.awayTeam?.id) ?? [];
  const hasEvents = (detail?.goals.length ?? 0) + (detail?.cards.length ?? 0) > 0;

  function GoalEvent({ g, side }) {
    return (
      <div className={`camp-report-event ${side}`}>
        <span className="camp-report-event-icon">⚽</span>
        {g.ownGoal
          ? <span className="camp-report-event-own">Gol Contra</span>
          : <>
              {g.player?.number && <span className="camp-report-event-num">{g.player.number}.</span>}
              <span className="camp-report-event-name">{g.player?.name ?? '—'}</span>
              {isVet(g.player, tournamentYear) && <VetBadge />}
            </>
        }
      </div>
    );
  }

  function CardEvent({ c, side }) {
    const icon = c.type === 'YELLOW' ? '🟡' : '🔴';
    return (
      <div className={`camp-report-event ${side}`}>
        <span className="camp-report-event-icon">{icon}</span>
        {c.player?.number && <span className="camp-report-event-num">{c.player.number}.</span>}
        <span className="camp-report-event-name">{c.player?.name ?? '—'}</span>
        {isVet(c.player, tournamentYear) && <VetBadge />}
      </div>
    );
  }

  function EventCol({ goals, cards, side }) {
    if (goals.length === 0 && cards.length === 0) {
      return <div className={`camp-report-events-col ${side === 'right' ? 'right' : ''}`} />;
    }
    return (
      <div className={`camp-report-events-col ${side === 'right' ? 'right' : ''}`}>
        {goals.map(g => <GoalEvent key={g.id} g={g} side={side === 'right' ? 'right' : ''} />)}
        {cards.map(c => <CardEvent key={c.id} c={c} side={side === 'right' ? 'right' : ''} />)}
      </div>
    );
  }

  return (
    <div className="camp-report-overlay" onClick={onClose}>
      <div className="camp-report-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>

        {/* ── Cabeçalho ── */}
        <div className="camp-report-header">
          <button className="camp-report-close" onClick={onClose} aria-label="Fechar">✕</button>

          <div className="camp-report-meta">
            <span>{PHASE_LABELS[match.phase] || match.phase}</span>
            {match.scheduledAt && (
              <>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>{formatDateTime(match.scheduledAt)}</span>
              </>
            )}
          </div>

          <div className="camp-report-score-row">
            <div className={`camp-report-team ${homeWon ? 'winner' : ''}`}>
              <TeamLogo name={homeName} logoUrl={match.homeTeam?.logoUrl} size={44} shape="shield" />
              <span className="camp-report-team-name">{homeName}</span>
            </div>

            <div className="camp-report-score-center">
              <div className="camp-report-score-num">
                <span>{match.homeScore}</span>
                <span className="camp-report-score-sep">×</span>
                <span>{match.awayScore}</span>
              </div>
              {match.homePenalties != null && (
                <div className="camp-report-penalties">
                  ({match.homePenalties} × {match.awayPenalties} pên.)
                </div>
              )}
            </div>

            <div className={`camp-report-team ${awayWon ? 'winner' : ''}`}>
              <TeamLogo name={awayName} logoUrl={match.awayTeam?.logoUrl} size={44} shape="shield" />
              <span className="camp-report-team-name">{awayName}</span>
            </div>
          </div>
        </div>

        {/* ── Corpo ── */}
        {loading ? (
          <div className="camp-report-loading">Carregando eventos...</div>
        ) : (
          <div className="camp-report-body">
            <div className="camp-report-events-label">Eventos da partida</div>

            {hasEvents ? (
              <div className="camp-report-events-cols">
                <EventCol goals={homeGoals} cards={homeCards} side="left" />
                <div className="camp-report-col-divider" />
                <EventCol goals={awayGoals} cards={awayCards} side="right" />
              </div>
            ) : (
              <div className="camp-report-events-cols">
                <p className="camp-report-no-events">Nenhum evento registrado.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Súmula ── */}
        {!loading && detail?.sumulaUrl && (
          <div className="camp-report-footer">
            <button className="camp-report-sumula-btn" onClick={() => setSumulaOpen(true)}>
              📎 Ver Súmula Digitalizada
            </button>
          </div>
        )}
      </div>

      {/* Lightbox da súmula */}
      {sumulaOpen && detail?.sumulaUrl && (
        <div className="camp-sumula-overlay" onClick={() => setSumulaOpen(false)}>
          <div className="camp-sumula-box" onClick={e => e.stopPropagation()}>
            <button className="camp-sumula-close" onClick={() => setSumulaOpen(false)} aria-label="Fechar súmula">✕</button>
            {detail.sumulaUrl.startsWith('data:application/pdf') || detail.sumulaUrl.endsWith('.pdf') ? (
              <iframe
                src={detail.sumulaUrl}
                title="Súmula digitalizada"
                style={{ width: '100%', height: '80vh', border: 'none', borderRadius: 6 }}
              />
            ) : (
              <img src={detail.sumulaUrl} alt="Súmula digitalizada"
                style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', borderRadius: 6 }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Match Card ───────────────────────────────────────────────────────────────

function MatchCard({ match, tournamentYear, onTeamClick }) {
  const [reportOpen, setReportOpen] = useState(false);
  const finished = match.status === 'FINISHED';
  const time     = match.scheduledAt ? formatTime(match.scheduledAt) : null;

  function handleTeamClick(team) {
    if (onTeamClick && team) onTeamClick({ name: team.name, logoUrl: team.logoUrl });
  }

  const teamNameClass = onTeamClick ? 'camp-team-clickable' : '';

  return (
    <>
      <div className={`camp-match-card ${finished ? 'finished' : ''}`}>
        {time && <div className="camp-match-time">🕐 {time}</div>}

        <div className="camp-match-teams">
          <div className={`camp-match-team home ${finished && match.homeScore > match.awayScore ? 'won' : ''}`}>
            {match.homeTeam
              ? <TeamLogo name={match.homeTeam.name} logoUrl={match.homeTeam.logoUrl} size={28} shape="shield" />
              : <TeamLogo name="?" logoUrl={null} size={28} shape="shield" />
            }
            <span
              className={`camp-match-team-name${match.homeTeam ? ` ${teamNameClass}` : ''}`}
              onClick={() => handleTeamClick(match.homeTeam)}
            >
              {match.homeTeam?.name || <em className="tbd">A definir</em>}
            </span>
          </div>

          <div className="camp-match-center">
            {finished ? (
              <div
                className="camp-match-score clickable"
                onClick={() => setReportOpen(true)}
                title="Ver detalhes da partida"
              >
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
            <span
              className={`camp-match-team-name${match.awayTeam ? ` ${teamNameClass}` : ''}`}
              onClick={() => handleTeamClick(match.awayTeam)}
            >
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {finished ? (
              <button className="camp-detail-chip" onClick={() => setReportOpen(true)}>
                📊 Ver detalhes
                {match.hasSumula && <span className="camp-sumula-dot" title="Súmula disponível" />}
              </button>
            ) : (
              <span className="camp-match-status scheduled">Agendada</span>
            )}
          </div>
        </div>
      </div>

      {reportOpen && (
        <MatchReportModal match={match} tournamentYear={tournamentYear} onClose={() => setReportOpen(false)} />
      )}
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function TournamentMatches({ matches, tournamentYear = new Date().getFullYear(), onTeamClick }) {
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

  return (
    <div className="camp-matches">

      {sortedDays.length > 0 && (
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
              {new Date(day + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
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
            {byDay[day].map(m => <MatchCard key={m.id} match={m} tournamentYear={tournamentYear} onTeamClick={onTeamClick} />)}
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
            {byPhase[phase].map(m => <MatchCard key={m.id} match={m} tournamentYear={tournamentYear} onTeamClick={onTeamClick} />)}
          </div>
        </div>
      ))}

    </div>
  );
}
