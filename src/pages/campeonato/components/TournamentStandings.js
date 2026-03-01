import React, { useState, useEffect } from 'react';

// ── Gera cor consistente a partir do nome do time ──────────────────────────
const PALETTE = [
  ['#1a3c6e', '#e8f0fb'],
  ['#7c2d12', '#fef3ef'],
  ['#14532d', '#f0fdf4'],
  ['#4c1d95', '#f5f3ff'],
  ['#713f12', '#fffbeb'],
  ['#164e63', '#ecfeff'],
  ['#881337', '#fff1f2'],
  ['#1e3a5f', '#eff6ff'],
  ['#3b0764', '#faf5ff'],
  ['#052e16', '#f0fdf4'],
  ['#422006', '#fefce8'],
  ['#0c4a6e', '#f0f9ff'],
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

// ── Cache global de logos buscados dinamicamente ────────────────────────────
// Evita refetch para o mesmo time em múltiplas renderizações
const _logoCache = {}; // { teamName: url | false }

async function fetchLogoFromSportsDB(name) {
  if (name in _logoCache) return _logoCache[name];

  try {
    const r = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(name)}`
    );
    const d = await r.json();
    const team = (d.teams || []).find(t =>
      t.strSport === 'Soccer' &&
      t.strTeamBadge &&
      t.strTeam.toLowerCase().includes(name.toLowerCase().split(' ')[0])
    );
    const url = team?.strTeamBadge ? team.strTeamBadge + '/tiny' : false;
    _logoCache[name] = url;
    return url;
  } catch {
    _logoCache[name] = false;
    return false;
  }
}

// ── Shield: logo real → busca dinâmica → iniciais ─────────────────────────
function TeamShield({ name, logoUrl }) {
  const [textColor, bgColor] = colorFromName(name);
  const initials = getInitials(name);

  // resolvedLogo: null=carregando, false=não encontrado, string=url
  const [resolvedLogo, setResolvedLogo] = useState(logoUrl || null);
  const [imgFailed, setImgFailed]       = useState(false);

  useEffect(() => {
    // Se já tem logo vinda da API, usa direto
    if (logoUrl) { setResolvedLogo(logoUrl); return; }

    // Sem logo no banco: tenta buscar pelo nome
    let cancelled = false;
    fetchLogoFromSportsDB(name).then(url => {
      if (!cancelled) setResolvedLogo(url || false);
    });
    return () => { cancelled = true; };
  }, [name, logoUrl]);

  // Tem URL e não falhou ao carregar a imagem
  if (resolvedLogo && !imgFailed) {
    return (
      <span className="ts-shield ts-shield--logo" style={{ background: bgColor }}>
        <img
          src={resolvedLogo}
          alt={name}
          className="ts-shield-img"
          onError={() => setImgFailed(true)}
        />
      </span>
    );
  }

  // Fallback: iniciais
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
                          <TeamShield name={s.team} logoUrl={s.teamLogo} />
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
