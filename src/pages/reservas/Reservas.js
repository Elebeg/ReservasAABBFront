// Enhanced ReservationsPage.jsx com ajustes para o backend
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { format, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './Reservas.css';

function ReservationsPage() {
  const { user, isAuthenticated } = useAuth();
  const [courts, setCourts] = useState([]);
  const [userReservations, setUserReservations] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingReservationId, setEditingReservationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Verificar e configurar token antes de cada operação API
  const setupApiAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Sessão expirada. Por favor, faça login novamente.');
      return false;
    }
    
    // Configurar o token no cabeçalho de autorização do Axios
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return true;
  };

  // Buscar dados iniciais
  useEffect(() => {
    if (isAuthenticated()) {
      fetchData();
    } else {
      setError('Você precisa estar autenticado para acessar esta página.');
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    if (!setupApiAuthToken()) return;
    
    setLoading(true);
    try {
      // Logging para debug
      console.log('Buscando dados com token:', api.defaults.headers.common['Authorization']);
      
      // Usando o endpoint correto para reservas do usuário atual - /reservations/me
      const [userReservationsRes, allReservationsRes, courtsRes] = await Promise.all([
        api.get('/reservations/me'),
        api.get('/reservations'),
        api.get('/courts')
      ]);

      setUserReservations(userReservationsRes.data);       
      setAllReservations(allReservationsRes.data);
      setCourts(courtsRes.data);
      
      console.log('Reservas do usuário:', userReservationsRes.data);
      console.log('Todas as reservas:', allReservationsRes.data);
    } catch (err) {
      const errorMessage = getApiErrorMessage(err);
      setError(`Erro ao carregar dados: ${errorMessage}`);
      console.error('Erro ao buscar dados:', err);
      
      // Se o erro for de autenticação, limpar dados do usuário
      if (err.response?.status === 401) {
        handleAuthError();
      }
    } finally {
      setLoading(false);
    }
  };

  // Gerar horários disponíveis (8h às 22h)
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i < 22; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  // Verificar se um horário está disponível
  const isTimeSlotAvailable = (courtId, time) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const timeStr = `${dateStr}T${time}:00`;
    const reservationTimeDate = new Date(timeStr);

    return !allReservations.some(reservation => 
      reservation.court.id === courtId && 
      new Date(reservation.startTime).getTime() === reservationTimeDate.getTime()
    );
  };

  // Tratamento de erros da API
  const getApiErrorMessage = (err) => {
    // Verificar se há uma mensagem específica da API
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    
    // Verificar código de status
    if (err.response?.status === 400) {
      return 'Requisição inválida. Verifique os dados e tente novamente.';
    } else if (err.response?.status === 401) {
      return 'Sessão expirada ou não autorizada.';
    } else if (err.response?.status === 403) {
      return 'Você não tem permissão para realizar esta operação.';
    } else if (err.response?.status === 404) {
      return 'Recurso não encontrado.';
    }
    
    // Mensagem genérica
    return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
  };

  // Tratamento de erro de autenticação
  const handleAuthError = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    // Redirecionar para a página de login seria ideal aqui
  };

  // Criar nova reserva
  const handleCreateReservation = async () => {
    if (!setupApiAuthToken()) return;
    
    if (!selectedCourt || !selectedTime) {
      setError('Por favor, selecione uma quadra e um horário.');
      return;
    }
  
    // Formatação correta para ISO 8601 com timezone
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const startTime = new Date(`${dateStr}T${selectedTime}:00`);
    const isoStartTime = startTime.toISOString();
  
    try {
      setLoading(true);
      const response = await api.post('/reservations', {
        courtId: selectedCourt,
        startTime: isoStartTime
      });
  
      // Adicione a nova reserva a ambas as listas
      setUserReservations([...userReservations, response.data]);
      setAllReservations([...allReservations, response.data]);
      setSuccess('Reserva criada com sucesso!');
      resetForm();
    } catch (err) {
      const errorMessage = getApiErrorMessage(err);
      setError(`Erro ao criar reserva: ${errorMessage}`);
      console.error('Erro ao criar reserva:', err);
      
      if (err.response?.status === 401) {
        handleAuthError();
      }
    } finally {
      setLoading(false);
    }
  };

  // Atualizar reserva
  const handleUpdateReservation = async () => {
    if (!setupApiAuthToken()) return;
    
    if (!selectedTime) {
      setError('Por favor, selecione um horário.');
      return;
    }
  
    // Formatação correta para ISO 8601 com timezone
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const startTime = new Date(`${dateStr}T${selectedTime}:00`);
    const isoStartTime = startTime.toISOString();
  
    try {
      setLoading(true);
      
      // Log para debug
      console.log(`Atualizando reserva #${editingReservationId}`);
      console.log('Dados enviados:', { startTime: isoStartTime });
      
      // Enviar apenas o startTime, o userId será extraído do JWT no backend
      const response = await api.put(`/reservations/${editingReservationId}`, {
        startTime: isoStartTime
      });
  
      // Atualize a reserva em ambas as listas
      setUserReservations(userReservations.map(res => 
        res.id === editingReservationId ? response.data : res
      ));
      
      setAllReservations(allReservations.map(res => 
        res.id === editingReservationId ? response.data : res
      ));
      
      setSuccess('Reserva atualizada com sucesso!');
      resetForm();
    } catch (err) {
      const errorMessage = getApiErrorMessage(err);
      setError(`Erro ao atualizar reserva: ${errorMessage}`);
      console.error('Erro ao atualizar reserva:', err);
      console.error('Detalhes da resposta:', err.response?.data);
      
      if (err.response?.status === 401) {
        handleAuthError();
      }
    } finally {
      setLoading(false);
    }
  };

  // Deletar reserva
  const handleDeleteReservation = async (id) => {
    if (!setupApiAuthToken()) return;
    
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return;
    }
  
    try {
      setLoading(true);
      
      // Log de debug para verificar o token antes da deleção
      console.log('Deletando reserva ID:', id);
      
      // O userId será extraído do JWT no backend
      await api.delete(`/reservations/${id}`);
      
      // Remova a reserva de ambas as listas
      setUserReservations(userReservations.filter(res => res.id !== id));
      setAllReservations(allReservations.filter(res => res.id !== id));
      
      setSuccess('Reserva cancelada com sucesso!');
    } catch (err) {
      const errorMessage = getApiErrorMessage(err);
      setError(`Erro ao cancelar reserva: ${errorMessage}`);
      console.error('Erro ao deletar reserva:', err);
      console.error('Detalhes da resposta:', err.response?.data);
      
      if (err.response?.status === 401) {
        handleAuthError();
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar dados para edição
  const handleEditReservation = (reservation) => {
    // O backend determina as permissões com base no token JWT
    const reservationDate = parseISO(reservation.startTime);
    
    setSelectedDate(reservationDate);
    setSelectedCourt(reservation.court.id);
    setSelectedTime(format(reservationDate, 'HH:mm'));
    setIsEditing(true);
    setEditingReservationId(reservation.id);
  };

  // Resetar formulário
  const resetForm = () => {
    setSelectedCourt(null);
    setSelectedTime('');
    setIsEditing(false);
    setEditingReservationId(null);
    
    // Limpar mensagens após 3 segundos
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 3000);
  };

  // Próximos 7 dias para seleção
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      days.push(date);
    }
    
    return days;
  };

  // Formatar data em português
  const formatDate = (date) => {
    return format(date, "EEE, dd 'de' MMMM", { locale: ptBR });
  };

  // Recarregar dados
  const handleRefresh = () => {
    fetchData();
  };

  if (loading && userReservations.length === 0) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="reservations-container">
      <h1>Reservas de Quadras</h1>
      
      {error && (
        <div className="alert alert-error">
          {error}
          <button className="close-btn" onClick={() => setError('')}>×</button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          {success}
          <button className="close-btn" onClick={() => setSuccess('')}>×</button>
        </div>
      )}
      
      <div className="page-actions">
        <button 
          className="btn btn-refresh" 
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Atualizando...' : 'Atualizar dados'}
        </button>
      </div>
      
      <div className="reservations-grid">
        <div className="reservations-form">
          <h2>{isEditing ? 'Editar Reserva' : 'Nova Reserva'}</h2>
          
          <div className="form-group">
            <label>Data:</label>
            <div className="date-selector">
              {getNextDays().map((day) => (
                <button
                  key={day.toISOString()}
                  className={`date-button ${selectedDate.toDateString() === day.toDateString() ? 'active' : ''}`}
                  onClick={() => setSelectedDate(day)}
                >
                  {formatDate(day)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Quadra:</label>
            <select 
              value={selectedCourt || ''}
              onChange={(e) => setSelectedCourt(Number(e.target.value))}
              disabled={isEditing}
            >
              <option value="">Selecione uma quadra</option>
              {courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name} Beach Tennis
                </option>
              ))}
            </select>
          </div>
          
          {selectedCourt && (
            <div className="form-group">
              <label>Horário:</label>
              <div className="time-slots">
                {generateTimeSlots().map((time) => {
                  const isAvailable = isEditing ? 
                    true : 
                    isTimeSlotAvailable(selectedCourt, time);
                  
                  return (
                    <button
                      key={time}
                      className={`time-slot ${selectedTime === time ? 'active' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                      onClick={() => isAvailable && setSelectedTime(time)}
                      disabled={!isAvailable}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="form-actions">
            {isEditing ? (
              <>
                <button 
                  className="btn btn-primary" 
                  onClick={handleUpdateReservation}
                  disabled={loading}
                >
                  {loading ? 'Atualizando...' : 'Atualizar Reserva'}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={resetForm}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={handleCreateReservation}
                disabled={loading || !selectedCourt || !selectedTime}
              >
                {loading ? 'Criando...' : 'Criar Reserva'}
              </button>
            )}
          </div>
        </div>
        
        <div className="user-reservations">
          <h2>Minhas Reservas</h2>
          
          {userReservations.length === 0 ? (
            <p className="no-reservations">Você não possui reservas.</p>
          ) : (
            <div className="reservations-list">
              {userReservations
                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                .map((reservation) => {
                  const reservationDate = parseISO(reservation.startTime);
                  const isPast = reservationDate < new Date();
                  
                  return (
                    <div 
                      key={reservation.id} 
                      className={`reservation-card ${isPast ? 'past' : ''}`}
                    >
                      <div className="reservation-info">
                        <h3>{reservation.court.name}</h3>
                        <p className="reservation-detail">
                          <span className="label">Data:</span> 
                          {format(reservationDate, "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        <p className="reservation-detail">
                          <span className="label">Horário:</span> 
                          {format(reservationDate, "HH:mm", { locale: ptBR })}
                        </p>
                        <p className="reservation-detail">
                          <span className="label">Local:</span> 
                          {reservation.court.name}
                        </p>
                      </div>
                      
                      {!isPast && (
                        <div className="reservation-actions">
                          <button
                            className="btn-icon edit"
                            onClick={() => handleEditReservation(reservation)}
                            title="Editar reserva"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                            </svg>
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDeleteReservation(reservation.id)}
                            title="Cancelar reserva"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                          </button>
                        </div>
                      )}
                      
                      {isPast && (
                        <div className="reservation-status">
                          <span className="status past">Finalizada</span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
      
      <div className="schedule-view">
        <h2>Agenda de Reservas</h2>
        <div className="court-schedule">
          {courts.map((court) => (
            <div key={court.id} className="court-timeline">
              <h3>{court.name}</h3>
              <div className="timeline">
                {generateTimeSlots().map((time) => {
                  const dateStr = format(selectedDate, 'yyyy-MM-dd');
                  const timeStr = `${dateStr}T${time}:00`;
                  const slotDate = new Date(timeStr);
                  
                  const reservation = allReservations.find(res => 
                    res.court.id === court.id && 
                    new Date(res.startTime).getTime() === slotDate.getTime()
                  );
                  
                  // Verificar se a reserva pertence ao usuário logado
                  const isUserReservation = reservation?.user?.id === user?.id;
                  
                  return (
                    <div 
                      key={`${court.id}-${time}`} 
                      className={`time-block ${reservation ? (isUserReservation ? 'user-reserved' : 'reserved') : 'available'}`}
                      title={reservation ? 
                        `Reservado por ${isUserReservation ? 'você' : reservation.user?.name || 'outro usuário'}` : 
                        'Disponível'
                      }
                    >
                      <span className="time-label">{time}</span>
                      {reservation && (
                        <div className="reservation-tooltip">
                          <p><strong>Reservado por:</strong> {isUserReservation ? 'Você' : reservation.user?.name || 'outro usuário'}</p>
                          <p><strong>Horário:</strong> {time}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReservationsPage;