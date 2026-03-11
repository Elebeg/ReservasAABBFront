import React, { useState } from 'react';
import { useChampionship } from './hooks/UseChampionship';
import TournamentStandings from './components/TournamentStandings';
import TournamentBracket   from './components/TournamentBracket';
import TournamentMatches   from './components/TournamentMatches';
import TournamentPlayers   from './components/TournamentPlayers';
import TeamProfile         from './components/TeamProfile';
import './Campeonato.css';

const FORMAT_LABELS = {
  GROUPS:   'Fase de Grupos + Mata-Mata',
  LEAGUE:   'Liga',
  KNOCKOUT: 'Mata-Mata Direto',
};

const STATUS_LABELS = {
  DRAFT:          'Em breve',
  GROUP_STAGE:    'Fase de Grupos',
  KNOCKOUT_STAGE: 'Mata-Mata',
  FINISHED:       'Encerrado',
};

function LoadingState() {
  return (
    <div className="camp-loading">
      <div className="camp-spinner" />
      <p>Carregando campeonato...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="camp-no-tournament">
      <div className="camp-no-tournament-icon">🏖️</div>
      <h2>Nenhum campeonato ativo no momento</h2>
      <p>
        Fique de olho! Assim que um novo campeonato for iniciado ele
        aparecerá aqui automaticamente.
      </p>
    </div>
  );
}

const STATUS_COLORS = {
  DRAFT:          { bg: 'rgba(107,114,128,0.25)', border: 'rgba(107,114,128,0.5)', text: '#d1d5db' },
  GROUP_STAGE:    { bg: 'rgba(59,130,246,0.25)',  border: 'rgba(59,130,246,0.5)',  text: '#93c5fd' },
  KNOCKOUT_STAGE: { bg: 'rgba(239,68,68,0.25)',   border: 'rgba(239,68,68,0.5)',   text: '#fca5a5' },
  FINISHED:       { bg: 'rgba(16,185,129,0.25)',  border: 'rgba(16,185,129,0.5)',  text: '#6ee7b7' },
};

export default function Campeonato() {
  const { tournament, standings, bracket, matches, players, loading, error } = useChampionship();
  const [tab, setTab] = useState('matches');
  const [selectedTeam, setSelectedTeam] = useState(null);

  const tournamentYear = tournament
    ? new Date(tournament.startDate || tournament.createdAt).getFullYear()
    : new Date().getFullYear();

  const showStandings = tournament && ['GROUPS', 'LEAGUE'].includes(tournament.format);
  const hasPlayers    = players && players.length > 0;

  // Stats do hero
  const matchesPlayed = matches ? matches.filter(m => m.status === 'FINISHED').length : 0;
  const totalMatches  = matches ? matches.length : 0;
  const totalGoals    = matches
    ? matches
        .filter(m => m.status === 'FINISHED')
        .reduce((acc, m) => acc + (m.homeScore ?? 0) + (m.awayScore ?? 0), 0)
    : 0;
  const numTeams = standings
    ? standings.reduce((acc, g) => acc + (g.entries?.length ?? 0), 0)
    : 0;

  const tabs = [
    { key: 'matches',   label: '🗓️ Partidas',      show: true },
    { key: 'standings', label: '📊 Classificação', show: showStandings },
    { key: 'bracket',   label: '🏆 Bracket',       show: true },
    { key: 'players',   label: '⚽ Artilharia',    show: hasPlayers },
  ].filter((t) => t.show);

  if (loading) {
    return (
      <div className="camp-page">
        <div className="camp-hero">
          <div className="camp-container">
            <h1 className="camp-hero-title">Campeonato</h1>
          </div>
        </div>
        <div className="camp-container camp-main">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="camp-page">
        <div className="camp-hero">
          <div className="camp-container">
            <h1 className="camp-hero-title">Campeonato</h1>
          </div>
        </div>
        <div className="camp-container camp-main">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="camp-page">
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

      {/* Hero */}
      <div className="camp-hero">
        <div className="camp-container">
          <div className="camp-hero-content">
            <div className="camp-hero-text">
              <span
                className="camp-hero-badge"
                style={{
                  background: STATUS_COLORS[tournament.status]?.bg,
                  borderColor: STATUS_COLORS[tournament.status]?.border,
                  color: STATUS_COLORS[tournament.status]?.text,
                }}
              >
                <span className="camp-hero-badge-dot" style={{ background: STATUS_COLORS[tournament.status]?.text }} />
                {STATUS_LABELS[tournament.status] || tournament.status}
              </span>

              <h1 className="camp-hero-title">{tournament.name}</h1>

              {tournament.description && (
                <p className="camp-hero-desc">{tournament.description}</p>
              )}

              <div className="camp-hero-chips">
                <span className="camp-hero-chip">
                  📋 {FORMAT_LABELS[tournament.format] || tournament.format}
                </span>
                {tournament.startDate && (
                  <span className="camp-hero-chip">
                    📅 {new Date(tournament.startDate).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="camp-hero-stats">
            <div className="camp-hero-stat">
              <span className="camp-hero-stat-value">{numTeams || '—'}</span>
              <span className="camp-hero-stat-label">Equipes</span>
            </div>
            <div className="camp-hero-stat-divider" />
            <div className="camp-hero-stat">
              <span className="camp-hero-stat-value">
                {matchesPlayed}<span className="camp-hero-stat-total">/{totalMatches}</span>
              </span>
              <span className="camp-hero-stat-label">Partidas jogadas</span>
            </div>
            <div className="camp-hero-stat-divider" />
            <div className="camp-hero-stat">
              <span className="camp-hero-stat-value">{totalGoals}</span>
              <span className="camp-hero-stat-label">Gols marcados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="camp-container camp-main">
        <div className="camp-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`camp-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="camp-tab-content">
          {tab === 'matches' && (
            <TournamentMatches matches={matches} tournamentYear={tournamentYear} onTeamClick={setSelectedTeam} />
          )}
          {tab === 'standings' && (
            <TournamentStandings
              standings={standings}
              teamsAdvancing={tournament.teamsAdvancing}
              onTeamClick={setSelectedTeam}
            />
          )}
          {tab === 'bracket' && (
            <TournamentBracket bracket={bracket} tournament={tournament} standings={standings} />
          )}
          {tab === 'players' && (
            <TournamentPlayers players={players} tournamentYear={tournamentYear} onTeamClick={setSelectedTeam} />
          )}
        </div>
      </div>
    </div>
  );
}
