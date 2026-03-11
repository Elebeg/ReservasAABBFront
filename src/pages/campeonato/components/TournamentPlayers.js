import React, { useState } from 'react';
import TeamLogo from './TeamLogo';

function isVet(player, year) {
  if (!player.birthDate) return false;
  return new Date(player.birthDate).getFullYear() <= year - 40;
}

const VetBadge = () => (
  <span style={{ marginLeft: 5, fontSize: '0.62rem', fontWeight: 700, color: '#fff', background: '#7c3aed', borderRadius: 3, padding: '1px 5px', verticalAlign: 'middle' }}>VET</span>
);

const SuspBadge = () => (
  <span style={{ marginLeft: 5, fontSize: '0.62rem', fontWeight: 700, color: '#fff', background: '#dc2626', borderRadius: 3, padding: '1px 5px', verticalAlign: 'middle' }}>SUSPENSO</span>
);

const PendBadge = () => (
  <span style={{ marginLeft: 5, fontSize: '0.62rem', fontWeight: 700, color: '#92400e', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 3, padding: '1px 5px', verticalAlign: 'middle' }}>⚠️ pendurado</span>
);

const POSITION_SHORT = {
  GOALKEEPER: 'GOL',
  DEFENDER:   'DEF',
  MIDFIELDER: 'MEI',
  FORWARD:    'ATA',
};

function normalize(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function TournamentPlayers({ players, tournamentYear = new Date().getFullYear(), onTeamClick }) {
  const [query, setQuery] = useState('');

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

  // rank real de cada jogador na lista completa
  const rankMap = new Map(scorers.map((p, i) => [p.id, i + 1]));

  const trimmed = query.trim();
  const visibleScorers = trimmed
    ? scorers.filter(p => normalize(p.name).includes(normalize(trimmed)))
    : scorers.slice(0, 15);

  return (
    <div className="camp-players">

      {/* ── Artilharia ── */}
      <div className="camp-group-section">
        <h3 className="camp-group-title">⚽ Artilharia</h3>

        {/* Barra de busca */}
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar jogador pelo nome…"
            style={{
              width: '100%',
              padding: '7px 12px',
              fontSize: '0.875rem',
              border: '1px solid var(--border-color, #dee2e6)',
              borderRadius: 6,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div className="camp-table-wrap">
          <table className="camp-table">
            <thead>
              <tr>
                <th className="camp-th pos">#</th>
                <th className="camp-th">Jogador</th>
                <th className="camp-th team" style={{ minWidth: 160 }}>Time</th>
                <th className="camp-th center">Pos.</th>
                <th className="camp-th center pts">Gols</th>
                <th className="camp-th center" title="Cartões Amarelos"><svg viewBox="0 0 10 14" width="10" height="14"><rect x="1" y="1" width="8" height="12" rx="1.5" fill="#eab308"/></svg></th>
                <th className="camp-th center" title="Cartões Vermelhos"><svg viewBox="0 0 10 14" width="10" height="14"><rect x="1" y="1" width="8" height="12" rx="1.5" fill="#dc2626"/></svg></th>
              </tr>
            </thead>
            <tbody>
              {visibleScorers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '16px 0', color: '#888', fontSize: '0.875rem' }}>
                    Nenhum jogador encontrado.
                  </td>
                </tr>
              ) : (
                visibleScorers.map(p => (
                  <tr key={p.id} className="camp-tr">
                    <td className="camp-td pos">{rankMap.get(p.id)}</td>
                    <td className="camp-td" style={{ fontWeight: 600 }}>
                      {p.name}
                      {isVet(p, tournamentYear) && <VetBadge />}
                      {p.suspended && <SuspBadge />}
                      {!p.suspended && p.yellowCardAccum === 1 && <PendBadge />}
                    </td>
                    <td className="camp-td">
                      <span
                        className="ts-team-cell"
                        onClick={onTeamClick && p.team ? () => onTeamClick({ name: p.team.name, logoUrl: p.team.logoUrl }) : undefined}
                        style={onTeamClick && p.team ? { cursor: 'pointer' } : undefined}
                      >
                        {p.team && (
                          <TeamLogo name={p.team.name} logoUrl={p.team.logoUrl} size={24} shape="shield" />
                        )}
                        <span className={onTeamClick && p.team ? 'camp-team-clickable' : ''} style={{ fontSize: '0.875rem' }}>{p.team?.name ?? '—'}</span>
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {!trimmed && scorers.length > 15 && (
          <p style={{ fontSize: '0.78rem', color: '#888', marginTop: 8 }}>
            Exibindo os 15 primeiros. Use a busca acima para encontrar outros jogadores.
          </p>
        )}
      </div>

      {/* ── Ranking Disciplinar ── */}
      {disciplinary.length > 0 && (
        <div className="camp-group-section" style={{ marginTop: 32 }}>
          <h3 className="camp-group-title">Ranking Disciplinar</h3>
          <div className="camp-table-wrap">
            <table className="camp-table">
              <thead>
                <tr>
                  <th className="camp-th">Jogador</th>
                  <th className="camp-th team" style={{ minWidth: 160 }}>Time</th>
                  <th className="camp-th center"><svg viewBox="0 0 10 14" width="10" height="14" style={{marginRight:4,verticalAlign:'middle'}}><rect x="1" y="1" width="8" height="12" rx="1.5" fill="#eab308"/></svg>Amarelos</th>
                  <th className="camp-th center"><svg viewBox="0 0 10 14" width="10" height="14" style={{marginRight:4,verticalAlign:'middle'}}><rect x="1" y="1" width="8" height="12" rx="1.5" fill="#dc2626"/></svg>Vermelhos</th>
                </tr>
              </thead>
              <tbody>
                {disciplinary.map(p => (
                  <tr key={p.id} className="camp-tr">
                    <td className="camp-td" style={{ fontWeight: 600 }}>
                      {p.name}
                      {isVet(p, tournamentYear) && <VetBadge />}
                      {p.suspended && <SuspBadge />}
                      {!p.suspended && p.yellowCardAccum === 1 && <PendBadge />}
                    </td>
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
