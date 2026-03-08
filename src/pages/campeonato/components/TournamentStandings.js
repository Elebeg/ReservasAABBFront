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
              <colgroup>
                <col style={{ width: 48 }} />   {/* # */}
                <col />                          {/* Time */}
                <col style={{ width: 38 }} />   {/* J */}
                <col style={{ width: 38 }} />   {/* V */}
                <col style={{ width: 38 }} />   {/* E */}
                <col style={{ width: 38 }} />   {/* D */}
                <col style={{ width: 44 }} />   {/* GP */}
                <col style={{ width: 44 }} />   {/* GC */}
                <col style={{ width: 44 }} />   {/* SG */}
                <col style={{ width: 48 }} />   {/* Pts */}
                <col style={{ width: 36 }} />   {/* 🟡 */}
                <col style={{ width: 36 }} />   {/* 🔴 */}
              </colgroup>
              <thead>
                <tr>
                  <th className="camp-th st-pos">#</th>
                  <th className="camp-th st-team">Time</th>
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

                      {/* Posição */}
                      <td className="camp-td st-pos">
                        <div className="st-pos-inner">
                          {advances && <span className="camp-advance-dot" />}
                          <span>{s.position}</span>
                        </div>
                      </td>

                      {/* Time: logo + nome sem gap */}
                      <td className="camp-td st-team">
                        <div
                          className={`st-team-inner${onTeamClick ? ' camp-team-clickable' : ''}`}
                          onClick={onTeamClick ? () => onTeamClick({ name: s.team, logoUrl: s.teamLogo }) : undefined}
                          style={onTeamClick ? { cursor: 'pointer' } : undefined}
                        >
                          <TeamLogo name={s.team} logoUrl={s.teamLogo} size={30} shape="shield" />
                          <span className="st-team-name">{s.team}</span>
                        </div>
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
