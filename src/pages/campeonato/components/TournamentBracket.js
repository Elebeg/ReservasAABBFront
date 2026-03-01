import React from 'react';

const PHASE_ORDER = ['ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL'];
const PHASE_SHORT = {
  ROUND_OF_16:   'Oitavas',
  QUARTER_FINAL: 'Quartas',
  SEMI_FINAL:    'Semifinal',
  FINAL:         'Final',
};

const SLOT_MIN  = 96;
const HEADER_H  = 38;

function MatchCard({ match, isFinal = false }) {
  if (!match) return null;
  const winnerId = match.winner?.id;
  const homeWon  = !!(winnerId && match.homeTeam?.id === winnerId);
  const awayWon  = !!(winnerId && match.awayTeam?.id === winnerId);
  const finished = match.status === 'FINISHED';

  return (
    <div className={`wb-card${isFinal ? ' wb-card--final' : ''}${finished ? ' wb-card--done' : ''}`}>
      <div className={`wb-row${homeWon ? ' wb-row--won' : ''}${!match.homeTeam ? ' wb-row--tbd' : ''}`}>
        {match.homeTeam?.logoUrl && <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="wb-team-logo" />}
      <span className="wb-name">{match.homeTeam?.name || 'A definir'}</span>
        {finished && <span className={`wb-score${homeWon ? ' wb-score--won' : ''}`}>{match.homeScore}</span>}
      </div>
      <div className="wb-sep" />
      <div className={`wb-row${awayWon ? ' wb-row--won' : ''}${!match.awayTeam ? ' wb-row--tbd' : ''}`}>
        {match.awayTeam?.logoUrl && <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="wb-team-logo" />}
      <span className="wb-name">{match.awayTeam?.name || 'A definir'}</span>
        {finished && <span className={`wb-score${awayWon ? ' wb-score--won' : ''}`}>{match.awayScore}</span>}
      </div>
      {match.homePenalties != null && (
        <div className="wb-pen">Pên: {match.homePenalties} × {match.awayPenalties}</div>
      )}
    </div>
  );
}

function RoundColumn({ round, colH, side }) {
  return (
    <div className={`wb-col wb-col--${side}`} style={{ height: colH }}>
      <div className="wb-col-header">{PHASE_SHORT[round.phase]}</div>
      <div className="wb-col-matches" style={{ height: colH - HEADER_H }}>
        {round.matches.map(m => (
          <div key={m.id} className="wb-slot">
            <MatchCard match={m} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TournamentBracket({ bracket }) {
  if (!bracket?.rounds?.length) {
    return (
      <div className="camp-empty">
        <span className="camp-empty-icon">🏆</span>
        <p>O bracket será exibido quando o torneio avançar para o mata-mata.</p>
      </div>
    );
  }

  const sorted = [...bracket.rounds].sort(
    (a, b) => PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase)
  );

  const finalRound        = sorted.find(r => r.phase === 'FINAL');
  const progressionRounds = sorted.filter(r => r.phase !== 'FINAL');
  const finalMatch        = finalRound?.matches?.[0] ?? null;
  const champion          = finalMatch?.winner;

  const outerMatchCount = progressionRounds.length > 0
    ? Math.ceil(progressionRounds[0].matches.length / 2)
    : 1;

  const colH = Math.max(outerMatchCount * SLOT_MIN + HEADER_H, 240);

  const leftRounds = progressionRounds.map(r => ({
    ...r,
    matches: r.matches.slice(0, Math.ceil(r.matches.length / 2)),
  }));

  const rightRounds = [...progressionRounds]
    .reverse()
    .map(r => ({
      ...r,
      matches: r.matches.slice(Math.ceil(r.matches.length / 2)),
    }));

  if (progressionRounds.length === 0) {
    return (
      <div className="wb-wrapper">
        {champion && (
          <div className="wb-champion">
            <span className="wb-champion-trophy">🏆</span>
            <span className="wb-champion-label">CAMPEÃO</span>
            <span className="wb-champion-name">{champion.name}</span>
          </div>
        )}
        <div className="wb-final-only">
          <div className="wb-final-badge">🏆 FINAL</div>
          <MatchCard match={finalMatch} isFinal />
        </div>
      </div>
    );
  }

  return (
    <div className="wb-wrapper">
      {champion && (
        <div className="wb-champion">
          <span className="wb-champion-trophy">🏆</span>
          <span className="wb-champion-label">CAMPEÃO</span>
          <span className="wb-champion-name">{champion.name}</span>
        </div>
      )}

      <div className="wb-top-bar">
        <span className="wb-top-bar-side">Chave A</span>
        <span className="wb-top-bar-center">⚔ Mata-Mata</span>
        <span className="wb-top-bar-side">Chave B</span>
      </div>

      <div className="wb-scroll-wrap">
        <div className="wb-arena" style={{ minHeight: colH + 20 }}>
          <div className="wb-trophy-bg" aria-hidden="true">🏆</div>

          <div className="wb-side wb-side--left">
            {leftRounds.map(round => (
              <RoundColumn key={round.phase} round={round} colH={colH} side="left" />
            ))}
          </div>

          <div className="wb-final-zone" style={{ height: colH }}>
            <div className="wb-final-badge">🏆 FINAL</div>
            <div className="wb-final-body" style={{ height: colH - HEADER_H }}>
              {finalMatch
                ? <MatchCard match={finalMatch} isFinal />
                : (
                  <div className="wb-final-tbd">
                    <span className="wb-final-tbd-icon">⚔</span>
                    <span>Aguardando semifinais</span>
                  </div>
                )
              }
            </div>
          </div>

          <div className="wb-side wb-side--right">
            {rightRounds.map(round => (
              <RoundColumn key={round.phase + '_r'} round={round} colH={colH} side="right" />
            ))}
          </div>
        </div>
      </div>

      <div className="wb-legend">
        <span className="wb-legend-dot wb-legend-dot--won" />
        <span>Classificado</span>
        <span className="wb-legend-dot wb-legend-dot--tbd" style={{ marginLeft: 20 }} />
        <span>A definir</span>
      </div>
    </div>
  );
}
