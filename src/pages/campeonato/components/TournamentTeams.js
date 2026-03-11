import TeamLogo from './TeamLogo';
import TeamProfile from './TeamProfile';
import { useState, useMemo } from 'react';

export default function TournamentTeams({ matches, standings, players, tournamentYear, tournament }) {
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Extrai times únicos das partidas
  const teams = useMemo(() => {
    const map = new Map();
    (matches || []).forEach(m => {
      if (m.homeTeam) map.set(m.homeTeam.id, m.homeTeam);
      if (m.awayTeam) map.set(m.awayTeam.id, m.awayTeam);
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [matches]);

  // Busca posição do time na classificação
  const positionOf = (teamName) => {
    for (const group of (standings || [])) {
      const entry = (group.standings || []).find(s => s.team === teamName);
      if (entry) return { position: entry.position, group: group.group, pts: entry.points };
    }
    return null;
  };

  // Conta vitórias e gols do time
  const statsOf = (teamName) => {
    const teamMatches = (matches || []).filter(
      m => m.status === 'FINISHED' && (m.homeTeam?.name === teamName || m.awayTeam?.name === teamName)
    );
    let wins = 0, goals = 0, played = teamMatches.length;
    teamMatches.forEach(m => {
      const isHome = m.homeTeam?.name === teamName;
      const us   = isHome ? m.homeScore : m.awayScore;
      const them = isHome ? m.awayScore : m.homeScore;
      goals += us ?? 0;
      if (us > them) wins++;
    });
    return { played, wins, goals };
  };

  if (teams.length === 0) {
    return (
      <div className="camp-empty">
        <span className="camp-empty-icon">—</span>
        <p>Nenhum time cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <>
      {selectedTeam && (
        <TeamProfile
          team={selectedTeam}
          players={players}
          standings={standings}
          matches={matches}
          tournamentYear={tournamentYear}
          onClose={() => setSelectedTeam(null)}
        />
      )}

      <div className="camp-teams-grid">
        {teams.map(team => {
          const pos   = positionOf(team.name);
          const stats = statsOf(team.name);
          return (
            <button
              key={team.id}
              className="camp-team-card"
              onClick={() => setSelectedTeam(team)}
            >
              <div className="camp-team-card-logo">
                <TeamLogo name={team.name} logoUrl={team.logoUrl} size={52} shape="shield" />
                {pos && (
                  <span className="camp-team-card-pos">#{pos.position}</span>
                )}
              </div>

              <div className="camp-team-card-info">
                <span className="camp-team-card-name">{team.name}</span>
                {pos && (
                  <span className="camp-team-card-group">{pos.group}</span>
                )}
              </div>

              <div className="camp-team-card-stats">
                <div className="camp-team-card-stat">
                  <span className="camp-team-card-stat-value">{stats.played}</span>
                  <span className="camp-team-card-stat-label">Jogos</span>
                </div>
                <div className="camp-team-card-stat">
                  <span className="camp-team-card-stat-value">{stats.wins}</span>
                  <span className="camp-team-card-stat-label">Vitórias</span>
                </div>
                <div className="camp-team-card-stat">
                  <span className="camp-team-card-stat-value">{stats.goals}</span>
                  <span className="camp-team-card-stat-label">Gols</span>
                </div>
                {pos && (
                  <div className="camp-team-card-stat">
                    <span className="camp-team-card-stat-value camp-team-card-stat-pts">{pos.pts}</span>
                    <span className="camp-team-card-stat-label">Pts</span>
                  </div>
                )}
              </div>

              <span className="camp-team-card-cta">Ver perfil →</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
