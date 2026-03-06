import React from 'react';
import TeamLogo from './TeamLogo';

const PHASE_ORDER = ['ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL'];
const PHASE_SHORT = {
  ROUND_OF_16:   'Oitavas',
  QUARTER_FINAL: 'Quartas',
  SEMI_FINAL:    'Semifinal',
  FINAL:         'Final',
};

// ── Bracket vazio (preview antes do mata-mata) ────────────────────────────────
const PHASE_MIN_TEAMS   = { ROUND_OF_16: 16, QUARTER_FINAL: 8, SEMI_FINAL: 4, FINAL: 2 };
const PHASE_MATCH_COUNT = { ROUND_OF_16: 8,  QUARTER_FINAL: 4, SEMI_FINAL: 2, FINAL: 1 };

function buildEmptyBracket(teamCount) {
  if (!teamCount || teamCount < 2) return null;
  const phases = PHASE_ORDER.filter(p => teamCount >= PHASE_MIN_TEAMS[p]);
  if (!phases.length) return null;
  return {
    rounds: phases.map(phase => ({
      phase,
      matches: Array.from({ length: PHASE_MATCH_COUNT[phase] }, (_, j) => ({
        id:          `empty-${phase}-${j}`,
        homeTeam:    null,
        awayTeam:    null,
        status:      'PENDING',
        scheduledAt: null,
        winner:      null,
        homeScore:   null,
        awayScore:   null,
      })),
    })),
  };
}

function knockoutTeamCount(tournament, standings) {
  if (!tournament) return 0;
  const { format, teamsAdvancing, groupCount } = tournament;
  if (format === 'GROUPS')   return (teamsAdvancing || 1) * (groupCount || 1);
  if (format === 'LEAGUE')   return teamsAdvancing || 0;
  if (format === 'KNOCKOUT') return standings?.length || 0;
  return 0;
}

const SLOT_MIN  = 96;
const HEADER_H  = 38;

function MatchCard({ match, isFinal = false }) {
  if (!match) return null;
  const winnerId = match.winner?.id;
  const homeWon  = !!(winnerId && match.homeTeam?.id === winnerId);
  const awayWon  = !!(winnerId && match.awayTeam?.id === winnerId);
  const finished = match.status === 'FINISHED';

  const fmtDate = match.scheduledAt
    ? new Date(match.scheduledAt).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <div className={`wb-card${isFinal ? ' wb-card--final' : ''}${finished ? ' wb-card--done' : ''}`}>
      {fmtDate && <div className="wb-date">📅 {fmtDate}</div>}
      <div className={`wb-row${homeWon ? ' wb-row--won' : ''}${!match.homeTeam ? ' wb-row--tbd' : ''}`}>
        <TeamLogo name={match.homeTeam?.name || '?'} logoUrl={match.homeTeam?.logoUrl || null} size={20} shape="shield" style={{ marginRight: 6 }} />
        <span className="wb-name">{match.homeTeam?.name || 'A definir'}</span>
        {finished && <span className={`wb-score${homeWon ? ' wb-score--won' : ''}`}>{match.homeScore}</span>}
      </div>
      <div className="wb-sep" />
      <div className={`wb-row${awayWon ? ' wb-row--won' : ''}${!match.awayTeam ? ' wb-row--tbd' : ''}`}>
        <TeamLogo name={match.awayTeam?.name || '?'} logoUrl={match.awayTeam?.logoUrl || null} size={20} shape="shield" style={{ marginRight: 6 }} />
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

export default function TournamentBracket({ bracket, tournament, standings }) {
  const hasRealBracket = bracket?.rounds?.length > 0;

  const resolved = hasRealBracket
    ? bracket
    : buildEmptyBracket(knockoutTeamCount(tournament, standings));

  if (!resolved) {
    return (
      <div className="camp-empty">
        <span className="camp-empty-icon">🏆</span>
        <p>O bracket será exibido quando o torneio avançar para o mata-mata.</p>
      </div>
    );
  }

  const sorted = [...resolved.rounds].sort(
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
          <TeamLogo name={champion.name} logoUrl={champion.logoUrl || null} size={72} shape="shield" />
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
