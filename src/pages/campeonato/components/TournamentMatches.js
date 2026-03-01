import React, { useState } from 'react';

const PHASE_LABELS = {
  GROUP:         'Fase de Grupos',
  ROUND_OF_16:   'Oitavas de Final',
  QUARTER_FINAL: 'Quartas de Final',
  SEMI_FINAL:    'Semifinal',
  FINAL:         'Final',
};

// Formata "2025-06-15" → "Domingo, 15 de Junho"
function formatDateHeader(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  });
}

// Formata ISO → "15:30"
function formatTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Extrai "YYYY-MM-DD" de um ISO timestamp (em horário local)
function toDateKey(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function MatchCard({ match }) {
  const finished = match.status === 'FINISHED';
  const time     = match.scheduledAt ? formatTime(match.scheduledAt) : null;

  return (
    <div className={`camp-match-card ${finished ? 'finished' : ''}`}>
      {time && (
        <div className="camp-match-time">🕐 {time}</div>
      )}

      <div className="camp-match-teams">
        <div className={`camp-match-team home ${finished && match.homeScore > match.awayScore ? 'won' : ''}`}>
          <span className="camp-match-team-name">
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
          <span className="camp-match-team-name">
            {match.awayTeam?.name || <em className="tbd">A definir</em>}
          </span>
        </div>
      </div>

      <div className="camp-match-footer">
        <span className="camp-match-phase-label">{PHASE_LABELS[match.phase] || match.phase}</span>
        <span className={`camp-match-status ${finished ? 'done' : 'scheduled'}`}>
          {finished ? '✓ Encerrada' : 'Agendada'}
        </span>
      </div>
    </div>
  );
}

export default function TournamentMatches({ matches }) {
  const [activeDay, setActiveDay] = useState(null);

  if (!matches || matches.length === 0) {
    return (
      <div className="camp-empty">
        <span className="camp-empty-icon">🗓️</span>
        <p>Nenhuma partida disponível ainda.</p>
      </div>
    );
  }

  // Separa partidas com data das sem data
  const withDate    = matches.filter(m => m.scheduledAt);
  const withoutDate = matches.filter(m => !m.scheduledAt);

  // Agrupa partidas com data por dia (YYYY-MM-DD)
  const byDay = {};
  withDate.forEach(m => {
    const key = toDateKey(m.scheduledAt);
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(m);
  });
  const sortedDays = Object.keys(byDay).sort();

  // Filtra pelo dia ativo (botões de filtro)
  const filteredDays = activeDay ? [activeDay] : sortedDays;

  // Agrupa sem data por fase
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

      {/* ── Filtro por dia ── */}
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

      {/* ── Partidas com data agrupadas por dia ── */}
      {filteredDays.map(day => (
        <div className="camp-phase-section" key={day}>
          <h3 className="camp-phase-title camp-phase-title--date">
            📅 {formatDateHeader(day)}
            <span className="camp-day-count">{byDay[day].length} partida{byDay[day].length > 1 ? 's' : ''}</span>
          </h3>
          <div className="camp-matches-grid">
            {byDay[day].map(m => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      ))}

      {/* ── Partidas sem data (sem filtro ativo) ── */}
      {!activeDay && sortedPhases.map(phase => (
        <div className="camp-phase-section" key={phase}>
          <h3 className="camp-phase-title">
            {PHASE_LABELS[phase] || phase}
            <span className="camp-day-count" style={{ opacity: 0.6 }}>Sem data definida</span>
          </h3>
          <div className="camp-matches-grid">
            {byPhase[phase].map(m => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      ))}

    </div>
  );
}
