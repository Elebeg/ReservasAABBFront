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
  const numTeams = standings && standings.length > 0
    ? standings.reduce((acc, g) => acc + (g.standings?.length ?? 0), 0)
    : matches
      ? new Set(matches.flatMap(m => [m.homeTeam?.id, m.awayTeam?.id]).filter(Boolean)).size
      : 0;

  const tabs = [
    {
      key: 'matches', show: true, label: 'Partidas',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      key: 'standings', show: showStandings, label: 'Classificação',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    },
    {
      key: 'bracket', show: true, label: 'Bracket',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="18" y2="12"/><rect x="10" y="9" width="4" height="6" rx="1"/></svg>,
    },
    {
      key: 'players', show: hasPlayers, label: 'Artilharia',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
    },
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

              <div className="camp-hero-meta-row">
                <span>{FORMAT_LABELS[tournament.format] || tournament.format}</span>
                {tournament.startDate && (
                  <>
                    <span className="camp-hero-meta-dot">·</span>
                    <span>Início em {new Date(tournament.startDate).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}</span>
                  </>
                )}
              </div>

              {tournament.description && (
                <p className="camp-hero-desc">{tournament.description}</p>
              )}
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
              <span className="camp-tab-icon">{t.icon}</span>
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
