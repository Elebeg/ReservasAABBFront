import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { tournamentService, tournamentRegistrationService } from '../../services/api';
import { toast } from 'react-toastify';
import './Tournaments.css';

const Tournaments = () => {
  const { user } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [tournamentRegistrations, setTournamentRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [registrationForm, setRegistrationForm] = useState({
    tournamentId: null,
    category: '',
    partnerName: '',
    partnerEmail: '',
    partnerPhone: '',
    observations: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch tournaments on component mount
  useEffect(() => {
    fetchTournaments();
    if (user) {
      fetchMyRegistrations();
    }
  }, [user]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const tournaments = await tournamentService.getAllTournaments();
      setTournaments(tournaments);
      if (tournaments.length > 0) {
        // Automatically select the first tournament
        setSelectedTournament(tournaments[0]);
        fetchTournamentRegistrations(tournaments[0].id);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast.error('Erro ao carregar torneios');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      const registrations = await tournamentRegistrationService.getMyRegistrations();
      setMyRegistrations(registrations);
    } catch (error) {
      console.error('Error fetching my registrations:', error);
      toast.error('Erro ao carregar suas inscrições');
    }
  };

  const fetchTournamentRegistrations = async (tournamentId) => {
    if (!tournamentId) return;

    try {
      const registrations = await tournamentRegistrationService.getTournamentRegistrations(tournamentId);
      setTournamentRegistrations(registrations);
    } catch (error) {
      console.error('Error fetching tournament registrations:', error);
      toast.error('Erro ao carregar inscrições do torneio');
    }
  };

  const handleTournamentSelect = (tournament) => {
    setSelectedTournament(tournament);
    fetchTournamentRegistrations(tournament.id);
    setRegistrationForm({
      ...registrationForm,
      tournamentId: tournament.id,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistrationForm({
      ...registrationForm,
      [name]: value,
    });
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!registrationForm.category?.trim()) {
      errors.category = 'Categoria é obrigatória';
    }
    
    if (selectedTournament?.requiresPartner) {
      if (!registrationForm.partnerName?.trim()) {
        errors.partnerName = 'Nome do parceiro é obrigatório';
      }
      
      if (!registrationForm.partnerEmail?.trim()) {
        errors.partnerEmail = 'Email do parceiro é obrigatório';
      } else if (!/\S+@\S+\.\S+/.test(registrationForm.partnerEmail)) {
        errors.partnerEmail = 'Email inválido';
      }
      
      if (!registrationForm.partnerPhone?.trim()) {
        errors.partnerPhone = 'Telefone do parceiro é obrigatório';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para se inscrever');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await tournamentRegistrationService.register({
        tournamentId: selectedTournament.id,
        ...registrationForm,
      });
      
      toast.success('Inscrição realizada com sucesso!');
      fetchMyRegistrations();
      fetchTournamentRegistrations(selectedTournament.id);
      
      // Reset form
      setRegistrationForm({
        tournamentId: selectedTournament.id,
        category: '',
        partnerName: '',
        partnerEmail: '',
        partnerPhone: '',
        observations: '',
      });
      
      // Switch to my registrations tab
      setActiveTab('myRegistrations');
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('Erro ao realizar inscrição');
    }
  };

  const handleCancelRegistration = async (registrationId) => {
    if (window.confirm('Tem certeza que deseja cancelar esta inscrição?')) {
      try {
        await tournamentRegistrationService.cancelRegistration(registrationId);
        toast.success('Inscrição cancelada com sucesso!');
        fetchMyRegistrations();
        if (selectedTournament) {
          fetchTournamentRegistrations(selectedTournament.id);
        }
      } catch (error) {
        console.error('Error cancelling registration:', error);
        toast.error('Erro ao cancelar inscrição');
      }
    }
  };

  // Filter upcoming tournaments (starts after today)
  const upcomingTournaments = tournaments.filter(
    (tournament) => new Date(tournament.startDate) > new Date()
  );

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  if (loading) {
    return <div className="loading">Carregando torneios...</div>;
  }

  return (
    <div className="tournaments-container">
      <h1>Torneios</h1>
      
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`} 
          onClick={() => setActiveTab('upcoming')}
        >
          Próximos Torneios
        </button>
        {user && (
          <button 
            className={`tab-button ${activeTab === 'myRegistrations' ? 'active' : ''}`} 
            onClick={() => setActiveTab('myRegistrations')}
          >
            Minhas Inscrições
          </button>
        )}
        {user && (
          <button 
            className={`tab-button ${activeTab === 'register' ? 'active' : ''}`} 
            onClick={() => setActiveTab('register')}
          >
            Fazer Inscrição
          </button>
        )}
      </div>
      
      {activeTab === 'upcoming' && (
        <div className="tournaments-list">
          <h2>Próximos Torneios</h2>
          {upcomingTournaments.length === 0 ? (
            <p>Não há torneios agendados no momento.</p>
          ) : (
            <div className="tournament-cards">
              {upcomingTournaments.map((tournament) => (
                <div 
                  key={tournament.id} 
                  className={`tournament-card ${selectedTournament?.id === tournament.id ? 'selected' : ''}`}
                  onClick={() => handleTournamentSelect(tournament)}
                >
                  <h3>{tournament.name}</h3>
                  <div className="tournament-dates">
                    <p><strong>Início:</strong> {formatDate(tournament.startDate)}</p>
                    <p><strong>Término:</strong> {formatDate(tournament.endDate)}</p>
                  </div>
                  <p><strong>Local:</strong> {tournament.location}</p>
                  <p><strong>Vagas:</strong> {tournament.maxParticipants}</p>
                  <div className="tournament-categories">
                    <strong>Categorias:</strong>
                    <ul>
                      {tournament.categories?.map((category, index) => (
                        <li key={index}>{category}</li>
                      ))}
                    </ul>
                  </div>
                  {user && (
                    <button 
                      className="register-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTournament(tournament);
                        setRegistrationForm({
                          ...registrationForm,
                          tournamentId: tournament.id,
                        });
                        setActiveTab('register');
                      }}
                    >
                      Inscrever-se
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {selectedTournament && (
            <div className="tournament-details">
              <h2>{selectedTournament.name} - Detalhes</h2>
              <div className="tournament-info">
                <p><strong>Descrição:</strong> {selectedTournament.description}</p>
                <p><strong>Data:</strong> {formatDate(selectedTournament.startDate)} a {formatDate(selectedTournament.endDate)}</p>
                <p><strong>Local:</strong> {selectedTournament.location}</p>
                <p><strong>Vagas:</strong> {selectedTournament.maxParticipants}</p>
                <p><strong>Preço:</strong> R$ {selectedTournament.price?.toFixed(2)}</p>
                <p><strong>Regulamento:</strong> {selectedTournament.rules || 'Não disponível'}</p>
              </div>
              
              <div className="tournament-registrations">
                <h3>Inscrições ({tournamentRegistrations.length})</h3>
                {tournamentRegistrations.length > 0 ? (
                  <ul className="registrations-list">
                    {tournamentRegistrations.map((reg) => (
                      <li key={reg.id} className="registration-item">
                        <p><strong>Atleta:</strong> {reg.userName}</p>
                        <p><strong>Categoria:</strong> {reg.category}</p>
                        {reg.partnerName && <p><strong>Parceiro:</strong> {reg.partnerName}</p>}
                        <p><strong>Status:</strong> {reg.status}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Nenhuma inscrição ainda.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'myRegistrations' && user && (
        <div className="my-registrations">
          <h2>Minhas Inscrições</h2>
          {myRegistrations.length === 0 ? (
            <p>Você não possui inscrições em torneios.</p>
          ) : (
            <div className="registrations-cards">
              {myRegistrations.map((registration) => (
                <div key={registration.id} className="registration-card">
                  <h3>{registration.tournamentName}</h3>
                  <p><strong>Categoria:</strong> {registration.category}</p>
                  <p><strong>Data:</strong> {formatDate(registration.tournamentStartDate)}</p>
                  {registration.partnerName && <p><strong>Parceiro:</strong> {registration.partnerName}</p>}
                  <p><strong>Status:</strong> {registration.status}</p>
                  <div className="registration-actions">
                    <button 
                      className="cancel-button"
                      onClick={() => handleCancelRegistration(registration.id)}
                    >
                      Cancelar Inscrição
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'register' && user && (
        <div className="registration-form-container">
          <h2>Inscrição em Torneio</h2>
          
          {!selectedTournament ? (
            <p>Selecione um torneio para fazer sua inscrição.</p>
          ) : (
            <>
              <h3>{selectedTournament.name}</h3>
              <form onSubmit={handleRegister} className="registration-form">
                <div className="form-group">
                  <label htmlFor="category">Categoria:</label>
                  <select
                    id="category"
                    name="category"
                    value={registrationForm.category}
                    onChange={handleInputChange}
                    className={formErrors.category ? 'error' : ''}
                  >
                    <option value="">Selecione uma categoria</option>
                    {selectedTournament.categories?.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                  {formErrors.category && <p className="error-message">{formErrors.category}</p>}
                </div>
                
                {selectedTournament.requiresPartner && (
                  <>
                    <div className="form-group">
                      <label htmlFor="partnerName">Nome do Parceiro:</label>
                      <input
                        type="text"
                        id="partnerName"
                        name="partnerName"
                        value={registrationForm.partnerName}
                        onChange={handleInputChange}
                        className={formErrors.partnerName ? 'error' : ''}
                      />
                      {formErrors.partnerName && <p className="error-message">{formErrors.partnerName}</p>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="partnerEmail">Email do Parceiro:</label>
                      <input
                        type="email"
                        id="partnerEmail"
                        name="partnerEmail"
                        value={registrationForm.partnerEmail}
                        onChange={handleInputChange}
                        className={formErrors.partnerEmail ? 'error' : ''}
                      />
                      {formErrors.partnerEmail && <p className="error-message">{formErrors.partnerEmail}</p>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="partnerPhone">Telefone do Parceiro:</label>
                      <input
                        type="tel"
                        id="partnerPhone"
                        name="partnerPhone"
                        value={registrationForm.partnerPhone}
                        onChange={handleInputChange}
                        className={formErrors.partnerPhone ? 'error' : ''}
                      />
                      {formErrors.partnerPhone && <p className="error-message">{formErrors.partnerPhone}</p>}
                    </div>
                  </>
                )}
                
                <div className="form-group">
                  <label htmlFor="observations">Observações:</label>
                  <textarea
                    id="observations"
                    name="observations"
                    value={registrationForm.observations}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Confirmar Inscrição
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Tournaments;