import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tournamentService, tournamentRegistrationService } from '../../services/TournamentService';
import { useAuth } from '../../contexts/AuthContext';
import './TournamentDetail.css';

const TournamentDetail = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRegistration, setUserRegistration] = useState(null);
  const [registrationForm, setRegistrationForm] = useState({
    category: '',
    partnerName: '',
    partnerEmail: '',
    observations: ''
  });
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        if (!isAuthenticated()) {
          navigate('/login', { state: { from: `/tournaments/${id}` } });
          return;
        }

        setLoading(true);
        const tournamentData = await tournamentService.getTournamentById(id);
        setTournament(tournamentData);
        
        // Fetch tournament registrations
        const registrationsData = await tournamentRegistrationService.getTournamentRegistrations(id);
        setRegistrations(registrationsData);
        
        // Check if user is already registered
        const userReg = registrationsData.find(reg => reg.userId === user.id);
        if (userReg) {
          setUserRegistration(userReg);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Erro ao carregar detalhes do torneio');
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, [id, isAuthenticated, navigate, user]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistrationForm({
      ...registrationForm,
      [name]: value
    });
    
    // Clear form error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!registrationForm.category) {
      errors.category = 'Por favor, selecione uma categoria';
    }
    
    // Only validate partner fields if the category requires a partner
    if (registrationForm.category && registrationForm.category.toLowerCase().includes('duplas')) {
      if (!registrationForm.partnerName) {
        errors.partnerName = 'Nome do parceiro é obrigatório';
      }
      if (!registrationForm.partnerEmail) {
        errors.partnerEmail = 'Email do parceiro é obrigatório';
      } else if (!/\S+@\S+\.\S+/.test(registrationForm.partnerEmail)) {
        errors.partnerEmail = 'Email do parceiro inválido';
      }
    }
    
    return errors;
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSubmitting(true);
    
    try {
      const registrationData = {
        tournamentId: parseInt(id),
        category: registrationForm.category,
        partnerName: registrationForm.partnerName || null,
        partnerEmail: registrationForm.partnerEmail || null,
        observations: registrationForm.observations || null
      };
      
      const response = await tournamentRegistrationService.register(registrationData);
      setUserRegistration(response);
      setShowRegistrationForm(false);
      setSuccessMessage('Inscrição realizada com sucesso!');
      
      // Refresh registrations list
      const registrationsData = await tournamentRegistrationService.getTournamentRegistrations(id);
      setRegistrations(registrationsData);
    } catch (err) {
      setError(err.message || 'Erro ao realizar inscrição');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!userRegistration) return;
    
    if (!confirm('Tem certeza que deseja cancelar sua inscrição?')) {
      return;
    }
    
    try {
      setLoading(true);
      await tournamentRegistrationService.cancelRegistration(userRegistration.id);
      setUserRegistration(null);
      setSuccessMessage('Inscrição cancelada com sucesso!');
      
      // Refresh registrations list
      const registrationsData = await tournamentRegistrationService.getTournamentRegistrations(id);
      setRegistrations(registrationsData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Erro ao cancelar inscrição');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tournament-detail-container loading">
        <div className="spinner"></div>
        <p>Carregando dados do torneio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tournament-detail-container error">
        <h2>Erro</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-retry">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="tournament-detail-container error">
        <h2>Torneio não encontrado</h2>
        <Link to="/tournaments" className="btn-back">
          Voltar para Torneios
        </Link>
      </div>
    );
  }

  const isTournamentActive = tournament.isActive && tournament.isRegistrationOpen && tournament.status !== 'finalizado';
  const isRegistrationFull = tournament.maxParticipants && registrations.length >= tournament.maxParticipants;

  return (
    <div className="tournament-detail-page">
      <div className="tournament-detail-container">
        <Link to="/tournaments" className="btn-back">
          <i className="icon-arrow-left"></i> Voltar para Torneios
        </Link>
        
        {successMessage && (
          <div className="success-message">
            <p>{successMessage}</p>
            <button onClick={() => setSuccessMessage('')} className="btn-close">
              <i className="icon-close"></i>
            </button>
          </div>
        )}
        
        <div className="tournament-header">
          <h1>{tournament.name}</h1>
          <div className="tournament-status-container">
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
        </div>
        
        <div className="tournament-info-card">
          <div className="tournament-info-section">
            <div className="info-item">
              <i className="icon-calendar"></i>
              <div>
                <h4>Data</h4>
                <p>{formatDate(tournament.date)}</p>
              </div>
            </div>
            
            <div className="info-item">
              <i className="icon-clock"></i>
              <div>
                <h4>Horário</h4>
                <p>{tournament.startTime || '08:00'} - {tournament.endTime || '18:00'}</p>
              </div>
            </div>
            
            <div className="info-item">
              <i className="icon-location"></i>
              <div>
                <h4>Local</h4>
                <p>{tournament.location || 'AABB'}</p>
              </div>
            </div>
            
            <div className="info-item">
              <i className="icon-tag"></i>
              <div>
                <h4>Tipo</h4>
                <p>{tournament.type === 'beach_tennis' ? 'Beach Tennis' : tournament.type}</p>
              </div>
            </div>
            
            <div className="info-item">
              <i className="icon-users"></i>
              <div>
                <h4>Participantes</h4>
                <p>{registrations.length} / {tournament.maxParticipants || '∞'}</p>
              </div>
            </div>
          </div>
          
          {tournament.description && (
            <div className="tournament-description">
              <h3>Descrição</h3>
              <p>{tournament.description}</p>
            </div>
          )}
          
          {tournament.categories && tournament.categories.length > 0 && (
            <div className="tournament-categories-section">
              <h3>Categorias</h3>
              <div className="categories-list">
                {tournament.categories.map((category, index) => (
                  <span key={index} className="category-tag">{category}</span>
                ))}
              </div>
            </div>
          )}
          
          {tournament.rules && (
            <div className="tournament-rules">
              <h3>Regras</h3>
              <p>{tournament.rules}</p>
            </div>
          )}
        </div>
        
        <div className="tournament-registration-section">
          <h2>Inscrição</h2>
          
          {userRegistration ? (
            <div className="user-registration-card">
              <h3>Você está inscrito neste torneio</h3>
              <div className="registration-details">
                <p><strong>Categoria:</strong> {userRegistration.category}</p>
                {userRegistration.partnerName && (
                  <p><strong>Parceiro:</strong> {userRegistration.partnerName}</p>
                )}
                {userRegistration.observations && (
                  <p><strong>Observações:</strong> {userRegistration.observations}</p>
                )}
              </div>
              <button 
                onClick={handleCancelRegistration}
                className="btn-cancel-registration"
              >
                Cancelar Inscrição
              </button>
            </div>
          ) : (
            <>
              {!isTournamentActive ? (
                <div className="registration-inactive">
                  <p>As inscrições para este torneio estão encerradas.</p>
                </div>
              ) : isRegistrationFull ? (
                <div className="registration-inactive">
                  <p>Este torneio atingiu o número máximo de participantes.</p>
                </div>
              ) : !showRegistrationForm ? (
                <button 
                  onClick={() => setShowRegistrationForm(true)}
                  className="btn-show-registration-form"
                >
                  Fazer Inscrição
                </button>
              ) : (
                <div className="registration-form-container">
                  <h3>Formulário de Inscrição</h3>
                  <form onSubmit={handleRegistration} className="registration-form">
                    <div className="form-group">
                      <label htmlFor="category">Categoria *</label>
                      <select 
                        id="category"
                        name="category"
                        value={registrationForm.category}
                        onChange={handleInputChange}
                        className={formErrors.category ? 'form-error' : ''}
                      >
                        <option value="">Selecione uma categoria</option>
                        {tournament.categories && tournament.categories.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))}
                      </select>
                      {formErrors.category && <p className="error-message">{formErrors.category}</p>}
                    </div>
                    
                    {registrationForm.category && registrationForm.category.toLowerCase().includes('duplas') && (
                      <>
                        <div className="form-group">
                          <label htmlFor="partnerName">Nome do Parceiro *</label>
                          <input 
                            type="text"
                            id="partnerName"
                            name="partnerName"
                            value={registrationForm.partnerName}
                            onChange={handleInputChange}
                            className={formErrors.partnerName ? 'form-error' : ''}
                          />
                          {formErrors.partnerName && <p className="error-message">{formErrors.partnerName}</p>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="partnerEmail">Email do Parceiro *</label>
                          <input 
                            type="email"
                            id="partnerEmail"
                            name="partnerEmail"
                            value={registrationForm.partnerEmail}
                            onChange={handleInputChange}
                            className={formErrors.partnerEmail ? 'form-error' : ''}
                          />
                          {formErrors.partnerEmail && <p className="error-message">{formErrors.partnerEmail}</p>}
                        </div>
                      </>
                    )}
                    
                    <div className="form-group">
                      <label htmlFor="observations">Observações</label>
                      <textarea 
                        id="observations"
                        name="observations"
                        value={registrationForm.observations}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Informações adicionais sobre sua inscrição"
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn-cancel"
                        onClick={() => setShowRegistrationForm(false)}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="btn-submit"
                        disabled={submitting}
                      >
                        {submitting ? 'Enviando...' : 'Confirmar Inscrição'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="tournament-participants-section">
          <h2>Participantes ({registrations.length})</h2>
          
          {registrations.length === 0 ? (
            <p className="no-participants">Ainda não há participantes inscritos.</p>
          ) : (
            <div className="participants-list">
              {registrations.map((registration) => (
                <div key={registration.id} className="participant-card">
                  <div className="participant-info">
                    <h4>{registration.userName || 'Participante'}</h4>
                    <p className="participant-category">{registration.category}</p>
                  </div>
                  {registration.partnerName && (
                    <div className="partner-info">
                      <p>Parceiro: {registration.partnerName}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;