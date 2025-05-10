import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tournamentService } from '../../services/TournamentService';
import { useAuth } from '../../contexts/AuthContext';
import './Tournaments.css';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated()) {
          navigate('/login', { state: { from: '/tournaments' } });
          return;
        }

        setLoading(true);
        const data = await tournamentService.getAllTournaments();
        setTournaments(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Erro ao carregar os torneios');
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [isAuthenticated, navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const isTournamentActive = (tournament) => {
    return tournament.isActive && tournament.isRegistrationOpen && tournament.status !== 'finalizado';
  };

  if (loading) {
    return (
      <div className="tournaments-container loading">
        <div className="spinner"></div>
        <p>Carregando torneios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tournaments-container error">
        <h2>Erro</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-retry">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="tournaments-page">
      <div className="tournaments-container">
        <div className="tournaments-header">
          <h1>Torneios</h1>
          <p>Confira os próximos torneios e faça sua inscrição</p>
        </div>

        {tournaments.length === 0 ? (
          <div className="no-tournaments">
            <p>Não há torneios disponíveis no momento.</p>
          </div>
        ) : (
          <div className="tournaments-grid">
            {tournaments.map((tournament) => (
              <div 
                key={tournament.id} 
                className={`tournament-card ${!isTournamentActive(tournament) ? 'inactive' : ''}`}
              >
                <div className="tournament-card-header">
                  <h3>{tournament.name}</h3>
                  {tournament.status === 'finalizado' && (
                    <span className="tournament-status finalized">Finalizado</span>
                  )}
                  {tournament.status !== 'finalizado' && !tournament.isRegistrationOpen && (
                    <span className="tournament-status closed">Inscrições Encerradas</span>
                  )}
                  {tournament.status !== 'finalizado' && tournament.isRegistrationOpen && (
                    <span className="tournament-status open">Inscrições Abertas</span>
                  )}
                </div>
                
                <div className="tournament-card-body">
                  <p className="tournament-date">
                    <i className="icon-calendar"></i> {formatDate(tournament.date)}
                  </p>
                  <p className="tournament-type">
                    <i className="icon-tag"></i> {tournament.type === 'beach_tennis' ? 'Beach Tennis' : tournament.type}
                  </p>
                  {tournament.categories && tournament.categories.length > 0 && (
                    <div className="tournament-categories">
                      <p>Categorias:</p>
                      <div className="categories-tags">
                        {tournament.categories.map((category, index) => (
                          <span key={index} className="category-tag">{category}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="tournament-participants">
                    <i className="icon-users"></i> 
                    {tournament.registrations?.length || 0} / {tournament.maxParticipants || '∞'} participantes
                  </p>
                </div>
                
                <div className="tournament-card-footer">
                  <Link 
                    to={`/tournaments/${tournament.id}`} 
                    className="btn-details"
                  >
                    Ver Detalhes
                  </Link>
                  {isTournamentActive(tournament) && (
                    <Link 
                      to={`/tournaments/${tournament.id}`} 
                      className="btn-register"
                    >
                      Inscrever-se
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tournaments;