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

export default function Campeonato() {
  const { tournament, standings, bracket, matches, players, loading, error } = useChampionship();
  const [tab, setTab] = useState('matches');
  const [selectedTeam, setSelectedTeam] = useState(null);

  const tournamentYear = tournament
    ? new Date(tournament.startDate || tournament.createdAt).getFullYear()
    : new Date().getFullYear();

  const showStandings = tournament && ['GROUPS', 'LEAGUE'].includes(tournament.format);
  const hasPlayers    = players && players.length > 0;

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
              <span className="camp-hero-badge">
                {STATUS_LABELS[tournament.status] || tournament.status}
              </span>
              <h1 className="camp-hero-title">{tournament.name}</h1>
              {tournament.description && (
                <p className="camp-hero-desc">{tournament.description}</p>
              )}
              <div className="camp-hero-meta">
                <span>📋 {FORMAT_LABELS[tournament.format] || tournament.format}</span>
                {tournament.startDate && (
                  <span>
                    📅 {new Date(tournament.startDate).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </span>
                )}
              </div>
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
