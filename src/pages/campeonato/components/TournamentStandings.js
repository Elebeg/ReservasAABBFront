import React from 'react';

// ── Gera cor consistente a partir do nome do time ──────────────────────────
// Mesmo time → sempre mesma cor. Baseado em hash simples do nome.
const PALETTE = [
  ['#1a3c6e', '#e8f0fb'], // azul marinho
  ['#7c2d12', '#fef3ef'], // vermelho tijolo
  ['#14532d', '#f0fdf4'], // verde escuro
  ['#4c1d95', '#f5f3ff'], // roxo
  ['#713f12', '#fffbeb'], // âmbar escuro
  ['#164e63', '#ecfeff'], // ciano escuro
  ['#881337', '#fff1f2'], // rosa escuro
  ['#1e3a5f', '#eff6ff'], // azul aço
  ['#3b0764', '#faf5ff'], // violeta
  ['#052e16', '#f0fdf4'], // verde floresta
  ['#422006', '#fefce8'], // marrom
  ['#0c4a6e', '#f0f9ff'], // azul céu
];

function colorFromName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function getInitials(name = '') {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// ── Shield (escudo) de iniciais ────────────────────────────────────────────
function TeamShield({ name }) {
  const [textColor, bgColor] = colorFromName(name);
  const initials = getInitials(name);

  return (
    <span className="ts-shield" style={{ background: bgColor, color: textColor }}>
      {initials}
    </span>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
export default function TournamentStandings({ standings, teamsAdvancing }) {
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
                  <th className="camp-th team" style={{ minWidth: 180 }}>Time</th>
                  <th className="camp-th center" title="Jogos">J</th>
                  <th className="camp-th center" title="Vitórias">V</th>
                  <th className="camp-th center" title="Empates">E</th>
                  <th className="camp-th center" title="Derrotas">D</th>
                  <th className="camp-th center" title="Gols Pró">GP</th>
                  <th className="camp-th center" title="Gols Contra">GC</th>
                  <th className="camp-th center" title="Saldo">SG</th>
                  <th className="camp-th center pts" title="Pontos">Pts</th>
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
                        <span className="ts-team-cell">
                          <TeamShield name={s.team} />
                          <span className="ts-team-name">{s.team}</span>
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
