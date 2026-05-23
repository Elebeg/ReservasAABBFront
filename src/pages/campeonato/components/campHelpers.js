/* Helpers compartilhados do campeonato */

// Últimos N resultados de um time (mais antigo → mais recente): 'W' | 'D' | 'L'
export function teamForm(teamName, matches, n = 5) {
  if (!teamName || !matches) return [];
  const played = matches
    .filter(m => m.status === 'FINISHED' && (m.homeTeam?.name === teamName || m.awayTeam?.name === teamName))
    .sort((a, b) => new Date(a.scheduledAt || 0) - new Date(b.scheduledAt || 0));
  return played.slice(-n).map(m => {
    const home = m.homeTeam?.name === teamName;
    const us   = home ? m.homeScore : m.awayScore;
    const them = home ? m.awayScore : m.homeScore;
    if (us > them) return 'W';
    if (us < them) return 'L';
    return 'D';
  });
}

// Resultado da partida sob a ótica do mandante: 'home' | 'draw' | 'away'
export function homeResult(m) {
  if (m.status !== 'FINISHED' || m.homeScore == null || m.awayScore == null) return null;
  if (m.homeScore > m.awayScore) return 'home';
  if (m.homeScore < m.awayScore) return 'away';
  return 'draw';
}
