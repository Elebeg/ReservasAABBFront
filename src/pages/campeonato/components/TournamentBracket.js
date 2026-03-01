import React from 'react';

function BracketMatch({ match }) {
  const winnerId = match.winner?.id;
  const homeWon  = winnerId && match.homeTeam?.id === winnerId;
  const awayWon  = winnerId && match.awayTeam?.id === winnerId;

  return (
    <div className={`camp-bracket-match ${match.status === 'FINISHED' ? 'finished' : ''}`}>
      <div className={`camp-bracket-team ${!match.homeTeam ? 'tbd' : ''} ${homeWon ? 'winner' : ''}`}>
        <span className="camp-bracket-team-name">
          {match.homeTeam?.name || <em>A definir</em>}
        </span>
        {match.homeScore !== null && match.homeScore !== undefined && (
          <span className="camp-bracket-score">{match.homeScore}</span>
        )}
      </div>

      <div className={`camp-bracket-team ${!match.awayTeam ? 'tbd' : ''} ${awayWon ? 'winner' : ''}`}>
        <span className="camp-bracket-team-name">
          {match.awayTeam?.name || <em>A definir</em>}
        </span>
        {match.awayScore !== null && match.awayScore !== undefined && (
          <span className="camp-bracket-score">{match.awayScore}</span>
        )}
      </div>

      {match.homePenalties !== null && match.homePenalties !== undefined && (
        <div className="camp-bracket-penalties">
          Pên: {match.homePenalties} × {match.awayPenalties}
        </div>
      )}
    </div>
  );
}

export default function TournamentBracket({ bracket }) {
  if (!bracket || !bracket.rounds?.length) {
    return (
      <div className="camp-empty">
        <span className="camp-empty-icon">🏆</span>
        <p>O bracket será exibido quando o torneio avançar para o mata-mata.</p>
      </div>
    );
  }

  const finalRound = bracket.rounds.find((r) => r.phase === 'FINAL');
  const champion   = finalRound?.matches?.[0]?.winner;

  return (
    <div className="camp-bracket-container">
      {champion && (
        <div className="camp-champion">
          <div className="camp-champion-trophy">🏆</div>
          <div className="camp-champion-label">Campeão</div>
          <div className="camp-champion-name">{champion.name}</div>
        </div>
      )}

      <div className="camp-bracket">
        {bracket.rounds.map((round) => (
          <div className="camp-bracket-round" key={round.phase}>
            <div className="camp-bracket-round-label">{round.label}</div>
            <div className="camp-bracket-matches">
              {round.matches.map((m) => (
                <BracketMatch key={m.id} match={m} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
