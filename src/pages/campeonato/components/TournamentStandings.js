import TeamLogo from './TeamLogo';
import { teamForm } from './campHelpers';

function FormDots({ form }) {
  if (!form.length) return <span className="cs-form-empty">—</span>;
  return (
    <span className="cs-form">
      {form.map((r, i) => (
        <span
          key={i}
          className={`cs-form-dot cs-form-${r.toLowerCase()}`}
          title={r === 'W' ? 'Vitória' : r === 'D' ? 'Empate' : 'Derrota'}
        >
          {r === 'W' ? 'V' : r === 'D' ? 'E' : 'D'}
        </span>
      ))}
    </span>
  );
}

export default function TournamentStandings({ standings, teamsAdvancing, matches = [], onTeamClick }) {
  if (!standings || standings.length === 0) {
    return (
      <div className="camp-empty">
        <p>Classificação ainda não disponível.</p>
      </div>
    );
  }

  const advCount = teamsAdvancing || 2;

  return (
    <div className="cs-wrap">
      {standings.map((group) => (
        <div className="cs-group" key={group.group}>
          <div className="cs-group-head">
            <h3 className="cs-group-title">{group.group}</h3>
            <span className="cs-key"><span className="cs-key-band" /> Zona de classificação</span>
          </div>

          <div className="cs-table-wrap">
            <table className="cs-table">
              <thead>
                <tr>
                  <th className="cs-th-pos">#</th>
                  <th className="cs-th-team">Time</th>
                  <th className="cs-th-form">Forma</th>
                  <th>P</th>
                  <th className="cs-hide-sm">J</th>
                  <th className="cs-hide-sm">V</th>
                  <th className="cs-hide-sm">E</th>
                  <th className="cs-hide-sm">D</th>
                  <th className="cs-hide-sm">GP</th>
                  <th className="cs-hide-sm">GC</th>
                  <th>SG</th>
                  <th className="cs-hide-sm cs-card-col" title="Cartões Amarelos"><svg viewBox="0 0 10 14" width="10" height="14"><rect x="1" y="1" width="8" height="12" rx="1.5" fill="#eab308"/></svg></th>
                  <th className="cs-hide-sm cs-card-col" title="Cartões Vermelhos"><svg viewBox="0 0 10 14" width="10" height="14"><rect x="1" y="1" width="8" height="12" rx="1.5" fill="#dc2626"/></svg></th>
                </tr>
              </thead>
              <tbody>
                {group.standings.map((s) => {
                  const advances = s.position <= advCount;
                  const cutoff = s.position === advCount;
                  const form = teamForm(s.team, matches);
                  return (
                    <tr
                      key={s.team}
                      className={`cs-row${advances ? ' is-advancing' : ''}${cutoff ? ' is-cutoff' : ''}`}
                      onClick={onTeamClick ? () => onTeamClick({ name: s.team, logoUrl: s.teamLogo }) : undefined}
                      style={onTeamClick ? { cursor: 'pointer' } : undefined}
                    >
                      <td className="cs-pos"><span className="cs-pos-num">{s.position}</span></td>
                      <td className="cs-team">
                        <TeamLogo name={s.team} logoUrl={s.teamLogo} size={28} shape="shield" />
                        <span className="cs-team-name">{s.team}</span>
                      </td>
                      <td className="cs-form-cell"><FormDots form={form} /></td>
                      <td className="cs-pts">{s.points}</td>
                      <td className="cs-hide-sm">{s.played}</td>
                      <td className="cs-hide-sm">{s.wins}</td>
                      <td className="cs-hide-sm">{s.draws}</td>
                      <td className="cs-hide-sm">{s.losses}</td>
                      <td className="cs-hide-sm">{s.goalsFor || 0}</td>
                      <td className="cs-hide-sm">{s.goalsAgainst || 0}</td>
                      <td className="cs-sg">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
                      <td className="cs-hide-sm cs-card-col" style={{ color: (s.yellowCards ?? 0) > 0 ? '#d68910' : undefined }}>
                        {s.yellowCards ?? 0}
                      </td>
                      <td className="cs-hide-sm cs-card-col" style={{ color: (s.redCards ?? 0) > 0 ? '#c0392b' : undefined }}>
                        {s.redCards ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="cs-foot">
            As <strong>{advCount}</strong> primeiras posições avançam para a próxima fase.
          </p>
        </div>
      ))}
    </div>
  );
}
