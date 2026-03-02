import React from 'react';
import TeamLogo from './TeamLogo';

const POSITION_SHORT = {
  GOALKEEPER: 'GOL',
  DEFENDER:   'DEF',
  MIDFIELDER: 'MEI',
  FORWARD:    'ATA',
};

export default function TournamentPlayers({ players, onTeamClick }) {
  if (!players || players.length === 0) {
    return (
      <div className="camp-empty">
        <span className="camp-empty-icon">⚽</span>
        <p>Artilharia ainda não disponível.</p>
      </div>
    );
  }

  const scorers      = [...players].sort((a, b) => b.goals - a.goals || a.yellowCards - b.yellowCards || a.name.localeCompare(b.name));
  const disciplinary = [...players].filter(p => p.yellowCards > 0 || p.redCards > 0)
    .sort((a, b) => b.redCards - a.redCards || b.yellowCards - a.yellowCards);

  return (
    <div className="camp-players">

      {/* ── Artilharia ── */}
      <div className="camp-group-section">
        <h3 className="camp-group-title">⚽ Artilharia</h3>
        <div className="camp-table-wrap">
          <table className="camp-table">
            <thead>
              <tr>
                <th className="camp-th pos">#</th>
                <th className="camp-th">Jogador</th>
                <th className="camp-th team" style={{ minWidth: 160 }}>Time</th>
                <th className="camp-th center">Pos.</th>
                <th className="camp-th center pts">Gols</th>
                <th className="camp-th center" title="Cartões Amarelos">🟡</th>
                <th className="camp-th center" title="Cartões Vermelhos">🔴</th>
              </tr>
            </thead>
            <tbody>
              {scorers.map((p, i) => (
                <tr key={p.id} className="camp-tr">
                  <td className="camp-td pos">{i + 1}</td>
                  <td className="camp-td" style={{ fontWeight: 600 }}>{p.name}</td>
                  <td className="camp-td">
                    <span
                      className="ts-team-cell"
                      onClick={onTeamClick && p.team ? () => onTeamClick({ name: p.team.name, logoUrl: p.team.logoUrl }) : undefined}
                      style={onTeamClick && p.team ? { cursor: 'pointer' } : undefined}
                    >
                      {p.team && (
                        <TeamLogo name={p.team.name} logoUrl={p.team.logoUrl} size={24} shape="shield" />
                      )}
                      <span style={{ fontSize: '0.875rem', ...(onTeamClick && p.team ? { textDecoration: 'underline', textDecorationStyle: 'dotted' } : {}) }}>{p.team?.name ?? '—'}</span>
                    </span>
                  </td>
                  <td className="camp-td center">
                    {p.position ? (
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px',
                        borderRadius: 4, background: '#e9ecef', color: '#495057',
                      }}>
                        {POSITION_SHORT[p.position] || p.position}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="camp-td center pts" style={{ fontWeight: 800 }}>{p.goals}</td>
                  <td className="camp-td center"
                    style={{ color: p.yellowCards > 0 ? '#d68910' : undefined }}>
                    {p.yellowCards || '—'}
                  </td>
                  <td className="camp-td center"
                    style={{ color: p.redCards > 0 ? '#c0392b' : undefined }}>
                    {p.redCards || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Ranking Disciplinar ── */}
      {disciplinary.length > 0 && (
        <div className="camp-group-section" style={{ marginTop: 32 }}>
          <h3 className="camp-group-title">🟡 Ranking Disciplinar</h3>
          <div className="camp-table-wrap">
            <table className="camp-table">
              <thead>
                <tr>
                  <th className="camp-th">Jogador</th>
                  <th className="camp-th team" style={{ minWidth: 160 }}>Time</th>
                  <th className="camp-th center">🟡 Amarelos</th>
                  <th className="camp-th center">🔴 Vermelhos</th>
                </tr>
              </thead>
              <tbody>
                {disciplinary.map(p => (
                  <tr key={p.id} className="camp-tr">
                    <td className="camp-td" style={{ fontWeight: 600 }}>{p.name}</td>
                    <td className="camp-td">
                      <span className="ts-team-cell">
                        {p.team && (
                          <TeamLogo name={p.team.name} logoUrl={p.team.logoUrl} size={24} shape="shield" />
                        )}
                        <span style={{ fontSize: '0.875rem' }}>{p.team?.name ?? '—'}</span>
                      </span>
                    </td>
                    <td className="camp-td center">
                      {p.yellowCards > 0
                        ? <span style={{ color: '#d68910', fontWeight: 700 }}>{p.yellowCards}</span>
                        : '—'
                      }
                    </td>
                    <td className="camp-td center">
                      {p.redCards > 0
                        ? <span style={{ color: '#c0392b', fontWeight: 700 }}>{p.redCards}</span>
                        : '—'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="camp-legend" style={{ marginTop: 8 }}>
            Critério de desempate na tabela: menos cartões vermelhos, depois menos amarelos.
          </p>
        </div>
      )}
    </div>
  );
}
