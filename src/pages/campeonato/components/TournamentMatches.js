import React from 'react';

const PHASE_LABELS = {
  GROUP:         'Fase de Grupos',
  ROUND_OF_16:   'Oitavas de Final',
  QUARTER_FINAL: 'Quartas de Final',
  SEMI_FINAL:    'Semifinal',
  FINAL:         'Final',
};

function MatchCard({ match }) {
  const finished = match.status === 'FINISHED';

  return (
    <div className={`camp-match-card ${finished ? 'finished' : ''}`}>
      <div className="camp-match-teams">
        {/* Casa */}
        <div className={`camp-match-team home ${finished && match.homeScore > match.awayScore ? 'won' : ''}`}>
          <span className="camp-match-team-name">
            {match.homeTeam?.name || <em className="tbd">A definir</em>}
          </span>
        </div>

        {/* Placar ou VS */}
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
          {match.homePenalties !== null && match.homePenalties !== undefined && (
            <div className="camp-match-penalties">
              ({match.homePenalties} × {match.awayPenalties} pen.)
            </div>
          )}
        </div>

        {/* Visitante */}
        <div className={`camp-match-team away ${finished && match.awayScore > match.homeScore ? 'won' : ''}`}>
          <span className="camp-match-team-name">
            {match.awayTeam?.name || <em className="tbd">A definir</em>}
          </span>
        </div>
      </div>

      <div className="camp-match-footer">
        <span className={`camp-match-status ${finished ? 'done' : 'scheduled'}`}>
          {finished ? '✓ Encerrada' : 'Agendada'}
        </span>
      </div>
    </div>
  );
}

export default function TournamentMatches({ matches }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="camp-empty">
        <span className="camp-empty-icon">🗓️</span>
        <p>Nenhuma partida disponível ainda.</p>
      </div>
    );
  }

  // Agrupa por fase mantendo a ordem natural
  const phaseOrder = ['GROUP', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL'];
  const grouped    = {};

  matches.forEach((m) => {
    if (!grouped[m.phase]) grouped[m.phase] = [];
    grouped[m.phase].push(m);
  });

  const sortedPhases = Object.keys(grouped).sort(
    (a, b) => phaseOrder.indexOf(a) - phaseOrder.indexOf(b)
  );

  return (
    <div className="camp-matches">
      {sortedPhases.map((phase) => (
        <div className="camp-phase-section" key={phase}>
          <h3 className="camp-phase-title">{PHASE_LABELS[phase] || phase}</h3>
          <div className="camp-matches-grid">
            {grouped[phase].map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
