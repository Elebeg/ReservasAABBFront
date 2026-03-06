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
const PHASE_MIN_TEAMS = { ROUND_OF_16: 16, QUARTER_FINAL: 8, SEMI_FINAL: 4, FINAL: 2 };

// Seeding padrão: 1 vs n, 2 vs n-1... estruturado recursivamente
function generateSeeds(n) {
  if (n <= 2) return [1, 2];
  const prev = generateSeeds(n / 2);
  const result = [];
  for (const s of prev) result.push(s, n + 1 - s);
  return result;
}

function buildEmptyBracket(teamCount) {
  if (!teamCount || teamCount < 2) return null;
  // Arredonda para próxima potência de 2
  const n = Math.pow(2, Math.ceil(Math.log2(Math.max(teamCount, 2))));
  const phases = PHASE_ORDER.filter(p => n >= PHASE_MIN_TEAMS[p]);
  if (!phases.length) return null;

  const seeds = generateSeeds(n); // ex: n=4 → [1,4,2,3]; n=8 → [1,8,4,5,2,7,3,6]

  return {
    rounds: phases.map((phase, phaseIndex) => {
      const matchCount = n / Math.pow(2, phaseIndex + 1);
      const isFirstRound = phaseIndex === 0;
      return {
        phase,
        matches: Array.from({ length: matchCount }, (_, j) => {
          let homeTeam = null;
          let awayTeam = null;
          if (isFirstRound) {
            const s1 = seeds[j * 2];
            const s2 = seeds[j * 2 + 1];
            if (s1 && s1 <= teamCount) homeTeam = { name: `${s1}º Lugar`, isPlaceholder: true, seed: s1 };
            if (s2 && s2 <= teamCount) awayTeam = { name: `${s2}º Lugar`, isPlaceholder: true, seed: s2 };
          }
          return {
            id:          `empty-${phase}-${j}`,
            homeTeam,
            awayTeam,
            status:      'PENDING',
            scheduledAt: null,
            winner:      null,
            homeScore:   null,
            awayScore:   null,
          };
        }),
      };
    }),
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

function TeamSlot({ team, won, finished, score }) {
  const isPlaceholder = team?.isPlaceholder;
  const isTbd = !team;
  const rowClass = `wb-row${won ? ' wb-row--won' : ''}${(isTbd || isPlaceholder) ? ' wb-row--tbd' : ''}`;
  return (
    <div className={rowClass}>
      {isPlaceholder
        ? <span className="wb-seed-badge">{team.seed}º</span>
        : <TeamLogo name={team?.name || '?'} logoUrl={team?.logoUrl || null} size={20} shape="shield" style={{ marginRight: 6 }} />
      }
      <span className="wb-name">{team?.name || 'A definir'}</span>
      {finished && <span className={`wb-score${won ? ' wb-score--won' : ''}`}>{score}</span>}
    </div>
  );
}

function MatchCard({ match, isFinal = false }) {
  if (!match) return null;
  const winnerId    = match.winner?.id;
  const homeWon     = !!(winnerId && match.homeTeam?.id === winnerId);
  const awayWon     = !!(winnerId && match.awayTeam?.id === winnerId);
  const finished    = match.status === 'FINISHED';
  const isPreview   = !match.homeTeam?.id && !match.awayTeam?.id; // ambos slots ainda vazios

  const fmtDate = match.scheduledAt
    ? new Date(match.scheduledAt).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <div className={`wb-card${isFinal ? ' wb-card--final' : ''}${finished ? ' wb-card--done' : ''}${isPreview ? ' wb-card--preview' : ''}`}>
      {fmtDate && <div className="wb-date">📅 {fmtDate}</div>}
      <TeamSlot team={match.homeTeam} won={homeWon} finished={finished} score={match.homeScore} />
      <div className="wb-sep" />
      <TeamSlot team={match.awayTeam} won={awayWon} finished={finished} score={match.awayScore} />
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
