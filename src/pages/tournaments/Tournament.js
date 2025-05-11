import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './Tournaments.css';

const Tournaments = () => {
  const { isAuthenticated, getUserId, user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [activeTournament, setActiveTournament] = useState(null);
  const [registrationForm, setRegistrationForm] = useState({
    tournamentId: Number(tournaments.id),
    category: '',
    partnerEmail: '',
    gender: user?.gender === 'Masculino' ? 'male' : user?.gender === 'Feminino' ? 'female' : ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // list, details, register

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all tournaments
        const tournamentsRes = await api.get('/tournaments');
        
        // Processar dados para garantir que informações do usuário estejam presentes
        const processedTournaments = tournamentsRes.data.map(tournament => {
          if (tournament.registrations && tournament.registrations.length > 0) {
            // Garantir que cada registro tenha as informações completas do usuário
            const processedRegistrations = tournament.registrations.map(reg => {
              return {
                ...reg,
                // Se não tiver user.name disponível, usar nome do usuário logado quando for o mesmo ID
                user: {
                  ...reg.user,
                  name: reg.user?.name || (reg.user?.id === getUserId() ? user?.name : null)
                }
              };
            });
            return { ...tournament, registrations: processedRegistrations };
          }
          return tournament;
        });
        
        setTournaments(processedTournaments);

        // If user is authenticated, fetch their registrations
        if (isAuthenticated()) {
          const registrationsRes = await api.get('/tournament-registrations/my-registrations');
          setUserRegistrations(registrationsRes.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erro ao carregar dados. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, getUserId, user]);

  const openTournamentDetails = (tournament) => {
    setActiveTournament(tournament);
    setViewMode('details');
    // Reset registration form when viewing a new tournament
    setRegistrationForm({
      tournamentId: tournament.id,
      category: '',
      partnerEmail: '',
      gender: user?.gender || ''
    });
  };

  const startRegistration = () => {
    if (!isAuthenticated()) {
      setError('Você precisa estar logado para se inscrever em um torneio.');
      return;
    }
    setViewMode('register');
    setIsRegistering(true);
    setFormErrors({});
    setFormSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistrationForm({
      ...registrationForm,
      [name]: value
    });
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!registrationForm.gender) {
      errors.gender = 'Gênero é obrigatório';
    }
    
    if (!registrationForm.category && activeTournament?.categories?.length > 0) {
      errors.category = 'Categoria é obrigatória';
    }

    return errors;
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }
  
    // Não usamos mais o isRegistering state
    // Usamos uma variável local para controlar o botão
    const submitButton = e.target.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Processando...';
    }
    
    setFormErrors({});
    
    try {
      const response = await api.post('/tournament-registrations', registrationForm);
      
      // Adicionar nome do usuário ao registro retornado da API
      const registrationWithUserData = {
        ...response.data,
        user: {
          ...response.data.user,
          name: user?.name || response.data.user?.name || 'Usuário'
        }
      };
      
      // Update registrations list
      setUserRegistrations(prevRegistrations => [...prevRegistrations, registrationWithUserData]);
      
      // Atualizar também a lista de registros do torneio ativo
      if (activeTournament) {
        const updatedTournament = {
          ...activeTournament,
          registrations: [...(activeTournament.registrations || []), registrationWithUserData]
        };
        setActiveTournament(updatedTournament);
        
        // Atualizar na lista geral de torneios
        setTournaments(prevTournaments => 
          prevTournaments.map(t => 
            t.id === activeTournament.id ? updatedTournament : t
          )
        );
      }
      
      setFormSuccess('Inscrição realizada com sucesso!');
      
      // Mudamos para o modo de detalhes após o sucesso
      setTimeout(() => {
        setViewMode('details');
      }, 2000);
      
    } catch (err) {
      console.error('Error registering:', err);
      setFormErrors({
        submit: err.response?.data?.message || 'Erro ao realizar inscrição. Tente novamente.'
      });
      
      // Reativamos o botão em caso de erro
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Confirmar Inscrição';
      }
    }
  };

  const cancelRegistration = async (registrationId) => {
    if (!window.confirm('Tem certeza que deseja cancelar sua inscrição?')) {
      return;
    }
    
    try {
      await api.delete(`/tournament-registrations/${registrationId}`);
      
      // Remove from local state
      setUserRegistrations(userRegistrations.filter(reg => reg.id !== registrationId));
      
      // Se tivermos um torneio ativo, remover o registro dele também
      if (activeTournament && activeTournament.registrations) {
        const updatedTournament = {
          ...activeTournament,
          registrations: activeTournament.registrations.filter(reg => reg.id !== registrationId)
        };
        setActiveTournament(updatedTournament);
        
        // Atualizar na lista geral de torneios
        setTournaments(prevTournaments => 
          prevTournaments.map(t => 
            t.id === activeTournament.id ? updatedTournament : t
          )
        );
      }
      
      setFormSuccess('Inscrição cancelada com sucesso!');
      setTimeout(() => setFormSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error cancelling registration:', err);
      setError(err.response?.data?.message || 'Erro ao cancelar inscrição. Tente novamente.');
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const isUserRegistered = (tournamentId) => {
    return userRegistrations.some(reg => reg.tournament.id === tournamentId);
  };

  const getUserRegistration = (tournamentId) => {
    return userRegistrations.find(reg => reg.tournament.id === tournamentId);
  };

  const renderTournamentList = () => {
    const now = new Date();
    const upcomingTournaments = tournaments.filter(t => new Date(t.date) >= now && t.isActive);
    const pastTournaments = tournaments.filter(t => new Date(t.date) < now || t.status === 'finalizado');
    
    const tournamentsToShow = activeTab === 'upcoming' ? upcomingTournaments : pastTournaments;
    
    if (tournamentsToShow.length === 0) {
      return (
        <div className="empty-state">
          <h3>{activeTab === 'upcoming' ? 'Nenhum torneio futuro encontrado.' : 'Nenhum torneio passado encontrado.'}</h3>
        </div>
      );
    }
    
    return (
      <div className="tournaments-grid">
        {tournamentsToShow.map(tournament => (
          <div 
            key={tournament.id} 
            className={`tournament-card ${isUserRegistered(tournament.id) ? 'registered' : ''}`}
            onClick={() => openTournamentDetails(tournament)}
          >
            <div className="tournament-header">
              <h3>{tournament.name}</h3>
              {isUserRegistered(tournament.id) && (
                <span className="registration-badge">Inscrito</span>
              )}
            </div>
            <div className="tournament-info">
              <p className="tournament-date">
                <i className="fa fa-calendar"></i> {formatDate(tournament.date)}
              </p>
              <p className="tournament-type">
                <i className="fa fa-trophy"></i> {tournament.type === 'beach_tennis' ? 'Beach Tennis' : tournament.type}
              </p>
              <p className="tournament-status">
                <i className="fa fa-info-circle"></i> 
                {tournament.isRegistrationOpen ? 'Inscrições Abertas' : 'Inscrições Fechadas'}
              </p>
            </div>
            <div className="tournament-participants">
              <p>{tournament.registrations?.length || 0} participantes registrados</p>
              {tournament.maxParticipants && (
                <div className="progress-bar">
                  <div 
                    className="progress" 
                    style={{width: `${(tournament.registrations?.length / tournament.maxParticipants) * 100}%`}}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTournamentDetails = () => {
    if (!activeTournament) return null;
    
    const tournamentDate = new Date(activeTournament.date);
    const isPastTournament = tournamentDate < new Date() || activeTournament.status === 'finalizado';
    const userRegistration = getUserRegistration(activeTournament.id);
    const registrationCount = activeTournament.registrations?.length || 0;
    const maxParticipants = activeTournament.maxParticipants || 0;
    const isFull = maxParticipants > 0 && registrationCount >= maxParticipants;
    
    return (
      <div className="tournament-details">
        <button className="back-button" onClick={() => setViewMode('list')}>
          <i className="fa fa-arrow-left"></i> Voltar
        </button>
        
        <div className="details-header">
          <h2>{activeTournament.name}</h2>
          <div className="tags">
            {activeTournament.isRegistrationOpen && !isPastTournament ? (
              <span className="tag open">Inscrições Abertas</span>
            ) : (
              <span className="tag closed">Inscrições Fechadas</span>
            )}
            {isPastTournament && <span className="tag finished">Finalizado</span>}
          </div>
        </div>
        
        <div className="details-content">
          <div className="detail-item">
            <strong>Data:</strong> {formatDate(activeTournament.date)}
          </div>
          
          <div className="detail-item">
            <strong>Tipo:</strong> {activeTournament.type === 'beach_tennis' ? 'Beach Tennis' : activeTournament.type}
          </div>
          
          {activeTournament.categories?.length > 0 && (
            <div className="detail-item">
              <strong>Categorias:</strong> {activeTournament.categories.join(', ')}
            </div>
          )}
          
          <div className="detail-item">
            <strong>Participantes:</strong> {registrationCount} {maxParticipants > 0 && `/ ${maxParticipants}`}
            {isFull && <span className="full-badge"> (Lotado)</span>}
          </div>
          
          {activeTournament.maxParticipantsByGender && (
            <div className="detail-item gender-limits">
              <strong>Limite por gênero:</strong>
              <div className="gender-stats">
                <div className="gender-stat">
                  <span>Masculino: </span>
                  <div className="gender-bar-container">
                    <div className="gender-bar">
                      <div 
                        className="gender-progress male" 
                        style={{
                          width: `${Math.min((activeTournament.registrations?.filter(r => r.gender === 'male').length || 0) / 
                            activeTournament.maxParticipantsByGender.male * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                    <span className="gender-count">
                      {activeTournament.registrations?.filter(r => r.gender === 'male').length || 0} / 
                      {activeTournament.maxParticipantsByGender.male}
                    </span>
                  </div>
                </div>
                <div className="gender-stat">
                  <span>Feminino: </span>
                  <div className="gender-bar-container">
                    <div className="gender-bar">
                      <div 
                        className="gender-progress female" 
                        style={{
                          width: `${Math.min((activeTournament.registrations?.filter(r => r.gender === 'female').length || 0) / 
                            activeTournament.maxParticipantsByGender.female * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                    <span className="gender-count">
                      {activeTournament.registrations?.filter(r => r.gender === 'female').length || 0} / 
                      {activeTournament.maxParticipantsByGender.female}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTournament.courts?.length > 0 && (
            <div className="detail-item">
              <strong>Quadras:</strong> {activeTournament.courts.map(court => court.name).join(', ')}
            </div>
          )}
        </div>
        
        <div className="registration-section">
          {userRegistration ? (
            <div className="user-registration">
              <h3>Sua Inscrição</h3>
              <div className="registration-details">
                <p><strong>Categoria:</strong> {userRegistration.category || 'Não especificada'}</p>
                <p><strong>Gênero:</strong> {userRegistration.gender === 'male' ? 'Masculino' : 'Feminino'}</p>
                {userRegistration.partnerEmail && (
                  <p><strong>Parceiro:</strong> {userRegistration.partnerEmail}</p>
                )}
              </div>
              
              {!isPastTournament && (
                <button 
                  className="cancel-registration-btn" 
                  onClick={() => cancelRegistration(userRegistration.id)}
                >
                  Cancelar Inscrição
                </button>
              )}
            </div>
          ) : (
            <div className="registration-options">
              {activeTournament.isRegistrationOpen && !isPastTournament && !isFull && isAuthenticated() ? (
                <button 
                  className="register-btn" 
                  onClick={startRegistration}
                >
                  Inscrever-se no Torneio
                </button>
              ) : !isAuthenticated() ? (
                <p className="login-message">Faça login para se inscrever neste torneio.</p>
              ) : isPastTournament ? (
                <p className="closed-message">Este torneio já foi encerrado.</p>
              ) : !activeTournament.isRegistrationOpen ? (
                <p className="closed-message">As inscrições para este torneio estão fechadas.</p>
              ) : (
                <p className="closed-message">Este torneio está com vagas esgotadas.</p>
              )}
            </div>
          )}
        </div>
        
        <div className="participants-list">
          <h3>Participantes Inscritos ({registrationCount})</h3>
          {activeTournament.registrations?.length > 0 ? (
            <table className="participants-table">
              <thead>
                <tr>
                  <th>Jogador</th>
                  <th>Gênero</th>
                  <th>Categoria</th>
                  <th>Parceiro</th>
                </tr>
              </thead>
              <tbody>
                {activeTournament.registrations.map(reg => {
                  // Lógica para mostrar o nome do usuário corretamente
                  let displayName = reg.user?.name;
                  
                  // Se for o usuário atual e não tivermos o nome, usar o do contexto de autenticação
                  if (!displayName && reg.user?.id === getUserId() && user?.name) {
                    displayName = user.name;
                  }
                  
                  // Última tentativa: usar o email ou marcar como não informado
                  if (!displayName) {
                    displayName = reg.partnerEmail ? reg.partnerEmail.split('@')[0] : 'Não informado';
                  }
                  
                  return (
                    <tr key={reg.id} className={reg.user?.id === getUserId() ? 'current-user' : ''}>
                      <td>{displayName}</td>
                      <td>{reg.gender === 'male' ? 'Masculino' : 'Feminino'}</td>
                      <td>{reg.category || 'Não informada'}</td>
                      <td>{reg.partnerEmail || 'Sem parceiro'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="no-participants">Nenhum participante inscrito até o momento.</p>
          )}
        </div>
      </div>
    );
  };

  const renderRegistrationForm = () => {
    if (!activeTournament) return null;
    
    return (
      <div className="registration-form-container">
        <button className="back-button" onClick={() => setViewMode('details')}>
          <i className="fa fa-arrow-left"></i> Voltar
        </button>
        
        <h2>Inscrição para {activeTournament.name}</h2>
        
        {formSuccess && <div className="success-message">{formSuccess}</div>}
        {formErrors.submit && <div className="error-message">{formErrors.submit}</div>}
        
        <form onSubmit={handleSubmitRegistration} className="registration-form">
          <div className="form-group">
            <label htmlFor="gender">Gênero *</label>
            <select 
              id="gender" 
              name="gender" 
              value={registrationForm.gender} 
              onChange={handleInputChange}
              required
              className={formErrors.gender ? 'error' : ''}
            >
              <option value="">Selecione seu gênero</option>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
            </select>
            {formErrors.gender && <p className="error-text">{formErrors.gender}</p>}
          </div>
          
          {activeTournament.categories?.length > 0 && (
            <div className="form-group">
              <label htmlFor="category">Categoria *</label>
              <select 
                id="category" 
                name="category" 
                value={registrationForm.category} 
                onChange={handleInputChange}
                required
                className={formErrors.category ? 'error' : ''}
              >
                <option value="">Selecione sua categoria</option>
                {activeTournament.categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {formErrors.category && <p className="error-text">{formErrors.category}</p>}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="partnerEmail">Email do Parceiro *</label>
            <input 
              type="email" 
              id="partnerEmail" 
              name="partnerEmail" 
              value={registrationForm.partnerEmail} 
              onChange={handleInputChange}
              required
              placeholder="nome@exemplo.com"
              className={formErrors.partnerEmail ? 'error' : ''}
            />
            {formErrors.partnerEmail && <p className="error-text">{formErrors.partnerEmail}</p>}
          </div>
          
          <button 
            type="submit" 
            className="submit-registration-btn"
          >
            Confirmar Inscrição
          </button>
                      
        </form>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Carregando...</div>;
    }
    
    if (error) {
      return <div className="error-message global-error">{error}</div>;
    }
    
    switch (viewMode) {
      case 'details':
        return renderTournamentDetails();
      case 'register':
        return renderRegistrationForm();
      case 'list':
      default:
        return (
          <>
            <div className="tournaments-header">
              <h1>Torneios de Beach Tennis</h1>
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Próximos Torneios
                </button>
                <button
                  className={`tab ${activeTab === 'past' ? 'active' : ''}`}
                  onClick={() => setActiveTab('past')}
                >
                  Torneios Anteriores
                </button>
              </div>
            </div>
            
            {isAuthenticated() && userRegistrations.length > 0 && (
              <div className="my-registrations">
                <h2>Minhas Inscrições</h2>
                <div className="registrations-list">
                  {userRegistrations.map(reg => {
                    const tournamentDate = new Date(reg.tournament.date);
                    const isPast = tournamentDate < new Date();
                    
                    return (
                      <div key={reg.id} className={`registration-item ${isPast ? 'past' : ''}`}>
                        <div className="registration-info">
                          <h3 onClick={() => openTournamentDetails(reg.tournament)}>
                            {reg.tournament.name}
                          </h3>
                          <p className="registration-date">
                            {formatDate(reg.tournament.date)}
                          </p>
                          {reg.category && (
                            <p className="registration-category">
                              Categoria: {reg.category}
                            </p>
                          )}
                          {reg.partnerEmail && (
                            <p className="registration-partner">
                              Parceiro: {reg.partnerEmail}
                            </p>
                          )}
                        </div>
                        {!isPast && (
                          <button 
                            className="cancel-btn" 
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelRegistration(reg.id);
                            }}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {renderTournamentList()}
          </>
        );
    }
  };

  return (
    <div className="tournaments-container">
      {renderContent()}
    </div>
  );
};

export default Tournaments;