import React from 'react';
import TeamLogo from './TeamLogo';

function isVet(player, year) {
  if (!player.birthDate) return false;
  return new Date(player.birthDate).getFullYear() <= year - 40;
}

const VetBadge = () => (
  <span style={{ marginLeft: 5, fontSize: '0.6rem', fontWeight: 700, color: '#fff', background: '#7c3aed', borderRadius: 3, padding: '1px 4px', verticalAlign: 'middle' }}>VET</span>
);

const SuspBadge = () => (
  <span style={{ marginLeft: 5, fontSize: '0.6rem', fontWeight: 700, color: '#fff', background: '#dc2626', borderRadius: 3, padding: '1px 4px', verticalAlign: 'middle' }}>SUSPENSO</span>
);

const PendBadge = () => (
  <span style={{ marginLeft: 5, fontSize: '0.6rem', fontWeight: 700, color: '#92400e', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 3, padding: '1px 4px', verticalAlign: 'middle' }}>⚠️ pendurado</span>
);

const POSITION_SHORT = {
  GOALKEEPER: 'GOL',
  DEFENDER:   'DEF',
  MIDFIELDER: 'MEI',
  FORWARD:    'ATA',
};

const PHASE_LABELS = {
  GROUP:         'Fase de Grupos',
  ROUND_OF_16:   'Oitavas',
  QUARTER_FINAL: 'Quartas',
  SEMI_FINAL:    'Semifinal',
  FINAL:         'Final',
};

const RESULT_STYLE = {
  W: { background: '#d1fae5', color: '#065f46', label: 'V' },
  D: { background: '#fef9c3', color: '#854d0e', label: 'E' },
  L: { background: '#fee2e2', color: '#991b1b', label: 'D' },
};

function StatBox({ label, value, primary }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '8px 4px',
      borderRadius: 8,
      background: primary ? 'var(--camp-primary, #1a56db)' : '#f1f3f5',
      color: primary ? '#fff' : '#212529',
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.6rem', fontWeight: 600, opacity: 0.7, marginTop: 3, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

export default function TeamProfile({ team, players, standings, matches, tournamentYear = new Date().getFullYear(), onClose }) {
  const teamPlayers = (players || [])
    .filter(p => p.team?.name === team.name)
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));

  const teamMatches = (matches || [])
    .filter(m => m.homeTeam?.name === team.name || m.awayTeam?.name === team.name)
    .sort((a, b) => {
      if (a.scheduledAt && b.scheduledAt) return new Date(b.scheduledAt) - new Date(a.scheduledAt);
      if (a.scheduledAt) return -1;
      if (b.scheduledAt) return 1;
      return 0;
    });

  const standing = (standings || [])
    .flatMap(g => g.standings || [])
    .find(s => s.team === team.name);

  const groupName = (standings || [])
    .find(g => (g.standings || []).some(s => s.team === team.name))?.group;

  function matchResult(m) {
    if (m.status !== 'FINISHED') return null;
    const isHome = m.homeTeam?.name === team.name;
    const us   = isHome ? m.homeScore : m.awayScore;
    const them = isHome ? m.awayScore : m.homeScore;
    if (us > them) return 'W';
    if (us < them) return 'L';
    return 'D';
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 540, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 12px 48px rgba(0,0,0,0.22)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #e9ecef', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <TeamLogo name={team.name} logoUrl={team.logoUrl} size={52} shape="shield" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{team.name}</h2>
            {groupName && standing && (
              <span style={{ fontSize: '0.78rem', color: '#6c757d', fontWeight: 500 }}>
                {groupName} &bull; {standing.position}º lugar &bull; {standing.points} pts
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#6c757d', padding: '4px 8px', borderRadius: 6, flexShrink: 0 }}>✕</button>
        </div>

        {/* ── Corpo (scrollável) ── */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Desempenho */}
          {standing && (
            <section>
              <h3 style={sectionTitle}>Desempenho</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                <StatBox label="Pts"  value={standing.points}   primary />
                <StatBox label="J"    value={standing.played} />
                <StatBox label="V"    value={standing.wins} />
                <StatBox label="E"    value={standing.draws} />
                <StatBox label="D"    value={standing.losses} />
                <StatBox label="GP"   value={standing.goalsFor} />
                <StatBox label="GC"   value={standing.goalsAgainst} />
                <StatBox label="SG"   value={standing.goalDiff > 0 ? `+${standing.goalDiff}` : standing.goalDiff} />
                <StatBox label={<svg viewBox="0 0 10 14" width="9" height="13"><rect x="1" y="1" width="8" height="12" rx="1.5" fill="#eab308"/></svg>} value={standing.yellowCards ?? 0} />
                <StatBox label={<svg viewBox="0 0 10 14" width="9" height="13"><rect x="1" y="1" width="8" height="12" rx="1.5" fill="#dc2626"/></svg>} value={standing.redCards ?? 0} />
              </div>
            </section>
          )}

          {/* Elenco */}
          {teamPlayers.length > 0 && (
            <section>
              <h3 style={sectionTitle}>Elenco ({teamPlayers.length})</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={th()}>Nome</th>
                      <th style={th('center')}>Pos.</th>
                      <th style={th('center')} title="Gols">G</th>
                      <th style={th('center')} title="Cartões Amarelos"><svg viewBox="0 0 10 14" width="9" height="13"><rect x="1" y="1" width="8" height="12" rx="1.5" fill="#eab308"/></svg></th>
                      <th style={th('center')} title="Cartões Vermelhos"><svg viewBox="0 0 10 14" width="9" height="13"><rect x="1" y="1" width="8" height="12" rx="1.5" fill="#dc2626"/></svg></th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamPlayers.map(p => (
                      <tr key={p.id} style={{ borderTop: '1px solid #f1f3f5' }}>
                        <td style={td()}>
                          {p.number != null && (
                            <span style={{ color: '#adb5bd', fontSize: '0.72rem', marginRight: 5 }}>#{p.number}</span>
                          )}
                          <span style={{ fontWeight: 600, textDecoration: p.suspended ? 'line-through' : 'none', color: p.suspended ? '#aaa' : undefined }}>{p.name}</span>
                          {isVet(p, tournamentYear) && <VetBadge />}
                          {p.suspended && <SuspBadge />}
                          {!p.suspended && p.yellowCardAccum === 2 && <PendBadge />}
                        </td>
                        <td style={td('center')}>
                          {p.position ? (
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#e9ecef', color: '#495057' }}>
                              {POSITION_SHORT[p.position] || p.position}
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ ...td('center'), fontWeight: 700, color: p.goals > 0 ? '#1a56db' : '#ced4da' }}>
                          {p.goals || '—'}
                        </td>
                        <td style={{ ...td('center'), fontWeight: p.yellowCards > 0 ? 700 : 400, color: p.yellowCards > 0 ? '#d68910' : '#ced4da' }}>
                          {p.yellowCards || '—'}
                        </td>
                        <td style={{ ...td('center'), fontWeight: p.redCards > 0 ? 700 : 400, color: p.redCards > 0 ? '#c0392b' : '#ced4da' }}>
                          {p.redCards || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Partidas */}
          {teamMatches.length > 0 && (
            <section>
              <h3 style={sectionTitle}>Partidas</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {teamMatches.map(m => {
                  const result  = matchResult(m);
                  const rs      = result ? RESULT_STYLE[result] : null;
                  const isHome  = m.homeTeam?.name === team.name;
                  const opponent      = isHome ? m.awayTeam : m.homeTeam;
                  const scoreHome     = m.status === 'FINISHED' ? m.homeScore : null;
                  const scoreAway     = m.status === 'FINISHED' ? m.awayScore : null;

                  return (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f8f9fa', borderRadius: 8, fontSize: '0.83rem' }}>
                      {rs ? (
                        <span style={{ ...rs, fontWeight: 700, fontSize: '0.68rem', padding: '2px 7px', borderRadius: 4, minWidth: 20, textAlign: 'center', flexShrink: 0 }}>
                          {rs.label}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', padding: '2px 7px', background: '#e9ecef', color: '#6c757d', borderRadius: 4, flexShrink: 0 }}>
                          {m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—'}
                        </span>
                      )}

                      <span style={{ fontSize: '0.7rem', color: '#868e96', flexShrink: 0 }}>
                        {PHASE_LABELS[m.phase] || m.phase}
                        {m.round ? ` R${m.round}` : ''}
                      </span>

                      <span style={{ fontSize: '0.7rem', color: '#adb5bd', flexShrink: 0 }}>
                        {isHome ? 'Casa' : 'Fora'}
                      </span>

                      <TeamLogo name={opponent?.name} logoUrl={opponent?.logoUrl} size={20} shape="shield" />

                      <span style={{ fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {opponent?.name || 'A definir'}
                      </span>

                      {scoreHome != null && (
                        <span style={{ fontWeight: 800, flexShrink: 0 }}>
                          {isHome ? scoreHome : scoreAway} × {isHome ? scoreAway : scoreHome}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {!standing && teamPlayers.length === 0 && teamMatches.length === 0 && (
            <p style={{ textAlign: 'center', color: '#adb5bd', padding: '24px 0' }}>
              Nenhuma informação disponível para este time ainda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── helpers de estilo ──────────────────────────────────────────────────────────
const sectionTitle = {
  margin: '0 0 10px',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: '#868e96',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

function th(align = 'left') {
  return { padding: '7px 8px', textAlign: align, fontWeight: 600, color: '#495057', fontSize: '0.78rem', whiteSpace: 'nowrap' };
}
function td(align = 'left') {
  return { padding: '7px 8px', textAlign: align };
}
