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

// ─── Chip de local ─────────────────────────────────────────────────────────────
function VenueChip({ venue, style = {} }) {
  if (!venue) return null;
  const label = [venue.name, venue.city].filter(Boolean).join(' · ');
  const inner = (
    <span className="camp-venue-chip" style={style}>
      {/* ícone pin */}
      <svg viewBox="0 0 14 18" width="10" height="13" style={{ flexShrink: 0 }}>
        <path d="M7 0C4.24 0 2 2.24 2 5c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5z"
              fill="currentColor" opacity="0.85" />
        <circle cx="7" cy="5" r="2" fill="#fff" />
      </svg>
      <span className="camp-venue-chip-label">{label}</span>
    </span>
  );

  if (venue.mapUrl) {
    return (
      <a
        href={venue.mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="camp-venue-chip-link"
        title="Ver no mapa"
      >
        {inner}
        {/* ícone externo */}
        <svg viewBox="0 0 12 12" width="9" height="9" style={{ flexShrink: 0, opacity: 0.55, marginLeft: 2 }}>
          <path d="M10 1H7V2.5H8.79L5.15 6.15L6.21 7.21L9.5 3.71V5.5H11V2C11 1.45 10.55 1 10 1Z" fill="currentColor"/>
          <path d="M9.5 9.5H2.5V2.5H6V1H2.5C1.67 1 1 1.67 1 2.5V9.5C1 10.33 1.67 11 2.5 11H9.5C10.33 11 11 10.33 11 9.5V6H9.5V9.5Z" fill="currentColor"/>
        </svg>
      </a>
    );
  }
  return inner;
}

// ─── Modal de relatório de jogo ───────────────────────────────────────────────

function MatchReportModal({ match, tournamentYear, onClose }) {
  const [detail, setDetail]         = useState(null);
  const [loading, setLoading]       = useState(true);
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

  // Fecha com Escape
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const homeWon  = match.homeScore > match.awayScore;
  const awayWon  = match.awayScore > match.homeScore;
  const homeName = match.homeTeam?.name || 'Casa';
  const awayName = match.awayTeam?.name || 'Visitante';

  const homeGoals = detail?.goals.filter(g => g.teamId === match.homeTeam?.id) ?? [];
  const awayGoals = detail?.goals.filter(g => g.teamId === match.awayTeam?.id) ?? [];
  const homeCards = detail?.cards.filter(c => c.teamId === match.homeTeam?.id) ?? [];
  const awayCards = detail?.cards.filter(c => c.teamId === match.awayTeam?.id) ?? [];
  const hasEvents = (detail?.goals.length ?? 0) + (detail?.cards.length ?? 0) > 0;

  function EventList({ goals, cards, align }) {
    const items = [];
    goals.forEach(g => {
      const label = g.ownGoal
        ? <em className="camp-rm-own">Gol Contra</em>
        : <span className="camp-rm-name">
            {g.player?.number ? <span className="camp-rm-num">{g.player.number}.</span> : null}
            {g.player?.name ?? '—'}
            {isVet(g.player, tournamentYear) && <VetBadge />}
          </span>;
      items.push(<div key={`g${g.id}`} className="camp-rm-event"><span className="camp-rm-icon camp-rm-icon--goal">⚽</span>{label}</div>);
    });
    cards.filter(c => c.type === 'YELLOW').forEach(c => {
      items.push(
        <div key={`c${c.id}`} className="camp-rm-event">
          <svg viewBox="0 0 10 14" width="11" height="15" style={{flexShrink:0}}><rect x="1" y="1" width="8" height="12" rx="1.5" fill="#eab308"/></svg>
          <span className="camp-rm-name">
            {c.player?.number ? <span className="camp-rm-num">{c.player.number}.</span> : null}
            {c.player?.name ?? '—'}
            {isVet(c.player, tournamentYear) && <VetBadge />}
          </span>
        </div>
      );
    });
    cards.filter(c => c.type === 'RED').forEach(c => {
      items.push(
        <div key={`c${c.id}`} className="camp-rm-event">
          <svg viewBox="0 0 10 14" width="11" height="15" style={{flexShrink:0}}><rect x="1" y="1" width="8" height="12" rx="1.5" fill="#dc2626"/></svg>
          <span className="camp-rm-name">
            {c.player?.number ? <span className="camp-rm-num">{c.player.number}.</span> : null}
            {c.player?.name ?? '—'}
            {isVet(c.player, tournamentYear) && <VetBadge />}
          </span>
        </div>
      );
    });
    if (items.length === 0) return <div className="camp-rm-empty">—</div>;
    return <div className={`camp-rm-list ${align}`}>{items}</div>;
  }

  const wrapStyle = {
    position: 'fixed', inset: 0, zIndex: 900,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '8px',
    boxSizing: 'border-box',
    overflowX: 'hidden',
  };
  const backdropStyle = {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)',
  };
  const dialogStyle = {
    position: 'relative', zIndex: 1,
    background: '#fff', borderRadius: 14,
    width: '100%',
    maxWidth: 'min(540px, calc(100vw - 16px))',
    maxHeight: '90vh',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    boxSizing: 'border-box',
    boxShadow: '0 20px 60px rgba(0,0,0,0.28)',
    animation: 'campRmIn 0.18s ease',
  };

  const sumulaOverlay = sumulaOpen && detail?.sumulaUrl ? (
    <div
      onClick={() => setSumulaOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', background: '#fff', borderRadius: 12,
          padding: 10, maxWidth: 900, width: '100%',
          maxHeight: '92vh', overflow: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => setSumulaOpen(false)}
          aria-label="Fechar súmula"
          style={{
            position: 'absolute', top: 8, right: 8,
            width: 36, height: 36, borderRadius: '50%',
            border: 'none', background: 'rgba(0,0,0,0.12)',
            cursor: 'pointer', fontSize: '1rem', color: '#333',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1,
          }}
        >✕</button>
        {detail.sumulaUrl.startsWith('data:application/pdf') || detail.sumulaUrl.endsWith('.pdf') ? (
          <iframe src={detail.sumulaUrl} title="Súmula" style={{ width: '100%', height: '80vh', border: 'none', borderRadius: 6 }} />
        ) : (
          <img src={detail.sumulaUrl} alt="Súmula" style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', margin: '0 auto', borderRadius: 6 }} />
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
    {sumulaOverlay}
    <div style={wrapStyle} role="dialog" aria-modal="true">
      <div style={backdropStyle} onClick={onClose} />

      <div style={dialogStyle}>

        {/* ── Barra do topo: botão fechar ── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--camp-primary,#003882) 60%, #0e4f8a 130%)',
          display: 'flex', justifyContent: 'flex-end',
          padding: '6px 6px 0',
          flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            style={{
              width: 40, height: 40, borderRadius: '50%',
              border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.18)',
              color: '#fff', fontSize: '1rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* ── Cabeçalho com placar ── */}
        <div className="camp-rm-header">
          <div className="camp-rm-meta">
            <span>{PHASE_LABELS[match.phase] || match.phase}</span>
            {match.scheduledAt && (
              <span className="camp-rm-meta-sep">{formatDateTime(match.scheduledAt)}</span>
            )}
          </div>

          {/* ── Local no modal ── */}
          {match.venue && (
            <div className="camp-rm-venue">
              <VenueChip venue={match.venue} />
            </div>
          )}

          <div className="camp-rm-scoreboard">
            <div className={`camp-rm-team ${homeWon ? 'won' : ''}`}>
              <TeamLogo name={homeName} logoUrl={match.homeTeam?.logoUrl} size={40} shape="shield" />
              <span className="camp-rm-team-name">{homeName}</span>
            </div>

            <div className="camp-rm-score">
              <span className={homeWon ? 'bold' : ''}>{match.homeScore}</span>
              <span className="camp-rm-score-sep">×</span>
              <span className={awayWon ? 'bold' : ''}>{match.awayScore}</span>
              {match.homePenalties != null && (
                <div className="camp-rm-pen">({match.homePenalties}×{match.awayPenalties} pen.)</div>
              )}
            </div>

            <div className={`camp-rm-team ${awayWon ? 'won' : ''}`}>
              <TeamLogo name={awayName} logoUrl={match.awayTeam?.logoUrl} size={40} shape="shield" />
              <span className="camp-rm-team-name">{awayName}</span>
            </div>
          </div>
        </div>

        {/* ── Eventos (scrollável) ── */}
        <div className="camp-rm-body" style={{ overflowY: 'auto' }}>
          {loading ? (
            <p className="camp-rm-loading">Carregando eventos...</p>
          ) : (
            <>
              <div className="camp-rm-events-label">Eventos da partida</div>
              {hasEvents ? (
                <div className="camp-rm-events">
                  <EventList goals={homeGoals} cards={homeCards} align="left" />
                  <div className="camp-rm-divider" />
                  <EventList goals={awayGoals} cards={awayCards} align="right" />
                </div>
              ) : (
                <p className="camp-rm-no-events">Nenhum evento registrado.</p>
              )}
            </>
          )}

          {!loading && detail?.sumulaUrl && (
            <div className="camp-rm-sumula">
              <button className="camp-rm-sumula-btn" type="button" onClick={() => setSumulaOpen(true)}>
                Ver Súmula Digitalizada
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
    </>
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
        {time && <div className="camp-match-time">{time}</div>}

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

        {/* ── Local no card ── */}
        {match.venue && (
          <div className="camp-match-venue">
            <VenueChip venue={match.venue} />
          </div>
        )}

        <div className="camp-match-footer">
          <span className="camp-match-phase-label">{PHASE_LABELS[match.phase] || match.phase}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {finished ? (
              <button className="camp-detail-chip" onClick={() => setReportOpen(true)}>
                Ver detalhes
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
        <span className="camp-empty-icon">—</span>
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
            {formatDateHeader(day)}
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