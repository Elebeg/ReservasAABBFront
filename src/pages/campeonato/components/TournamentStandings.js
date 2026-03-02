import React from 'react';
import TeamLogo from './TeamLogo';

export default function TournamentStandings({ standings, teamsAdvancing, onTeamClick }) {
  if (!standings || standings.length === 0) {
    return (
      <div className="camp-empty">
        <span className="camp-empty-icon">📊</span>
        <p>Classificação ainda não disponível.</p>
      </div>
    );
  }

  return (
    <div className="camp-standings">
      {standings.map((group) => (
        <div className="camp-group-section" key={group.group}>
          <h3 className="camp-group-title">{group.group}</h3>
          <div className="camp-table-wrap">
            <table className="camp-table">
              <thead>
                <tr>
                  <th className="camp-th pos">#</th>
                  <th className="camp-th team" style={{ minWidth: 200 }}>Time</th>
                  <th className="camp-th center" title="Jogos">J</th>
                  <th className="camp-th center" title="Vitórias">V</th>
                  <th className="camp-th center" title="Empates">E</th>
                  <th className="camp-th center" title="Derrotas">D</th>
                  <th className="camp-th center" title="Gols Pró">GP</th>
                  <th className="camp-th center" title="Gols Contra">GC</th>
                  <th className="camp-th center" title="Saldo">SG</th>
                  <th className="camp-th center pts" title="Pontos">Pts</th>
                  <th className="camp-th center" title="Cartões Amarelos">🟡</th>
                  <th className="camp-th center" title="Cartões Vermelhos">🔴</th>
                </tr>
              </thead>
              <tbody>
                {group.standings.map((s) => {
                  const advances = s.position <= (teamsAdvancing || 2);
                  return (
                    <tr key={s.team} className={`camp-tr ${advances ? 'advancing' : ''}`}>
                      <td className="camp-td pos">
                        {advances && <span className="camp-advance-dot" />}
                        {s.position}
                      </td>
                      <td className="camp-td team-name">
                        <span
                          className="ts-team-cell"
                          onClick={onTeamClick ? () => onTeamClick({ name: s.team, logoUrl: s.teamLogo }) : undefined}
                          style={onTeamClick ? { cursor: 'pointer' } : undefined}
                        >
                          <TeamLogo name={s.team} logoUrl={s.teamLogo} size={32} shape="shield" />
                          <span className={`ts-team-name${onTeamClick ? ' camp-team-clickable' : ''}`}>{s.team}</span>
                        </span>
                      </td>
                      <td className="camp-td center">{s.played}</td>
                      <td className="camp-td center">{s.wins}</td>
                      <td className="camp-td center">{s.draws}</td>
                      <td className="camp-td center">{s.losses}</td>
                      <td className="camp-td center">{s.goalsFor}</td>
                      <td className="camp-td center">{s.goalsAgainst}</td>
                      <td className="camp-td center">
                        {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                      </td>
                      <td className="camp-td center pts">{s.points}</td>
                      <td className="camp-td center" style={{ color: s.yellowCards > 0 ? '#d68910' : undefined }}>
                        {s.yellowCards ?? 0}
                      </td>
                      <td className="camp-td center" style={{ color: s.redCards > 0 ? '#c0392b' : undefined }}>
                        {s.redCards ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="camp-legend">
            <span className="camp-advance-dot" style={{ display: 'inline-block', marginRight: 6 }} />
            Avança para a próxima fase
          </p>
        </div>
      ))}
    </div>
  );
}
