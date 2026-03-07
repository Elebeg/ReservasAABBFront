import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { format, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './Reservas.css';

function CourtIllustration({ isSelected }) {
  const line = 'rgba(255,255,255,0.92)';
  return (
    <svg viewBox="0 0 200 120" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      {/* outer frame */}
      <rect width="200" height="120" fill="#b8955a" rx="6" />
      {/* sand surface */}
      <rect x="5" y="5" width="190" height="110" rx="4" fill="#e8c98a" />
      {/* sand texture dots */}
      <circle cx="28" cy="22" r="1.2" fill="rgba(0,0,0,0.07)" />
      <circle cx="55" cy="35" r="1"   fill="rgba(0,0,0,0.06)" />
      <circle cx="80" cy="18" r="1.3" fill="rgba(0,0,0,0.07)" />
      <circle cx="140" cy="28" r="1"  fill="rgba(0,0,0,0.06)" />
      <circle cx="165" cy="15" r="1.2" fill="rgba(0,0,0,0.07)" />
      <circle cx="35" cy="95" r="1.1" fill="rgba(0,0,0,0.07)" />
      <circle cx="68" cy="102" r="1"  fill="rgba(0,0,0,0.06)" />
      <circle cx="130" cy="98" r="1.3" fill="rgba(0,0,0,0.07)" />
      <circle cx="170" cy="90" r="1"  fill="rgba(0,0,0,0.06)" />
      <circle cx="45" cy="50" r="1"   fill="rgba(0,0,0,0.05)" />
      <circle cx="155" cy="72" r="1.1" fill="rgba(0,0,0,0.05)" />
      {/* court boundary */}
      <rect x="18" y="12" width="164" height="96" fill="none" stroke={line} strokeWidth="2.5" />
      {/* service lines (parallel to net) */}
      <line x1="18" y1="36" x2="182" y2="36" stroke={line} strokeWidth="1.5" strokeOpacity="0.85" />
      <line x1="18" y1="84" x2="182" y2="84" stroke={line} strokeWidth="1.5" strokeOpacity="0.85" />
      {/* center line dashed */}
      <line x1="100" y1="12" x2="100" y2="57" stroke={line} strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4,3" />
      <line x1="100" y1="63" x2="100" y2="108" stroke={line} strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4,3" />
      {/* net posts */}
      <rect x="13" y="50" width="6" height="20" rx="2" fill="#4a3728" />
      <rect x="181" y="50" width="6" height="20" rx="2" fill="#4a3728" />
      {/* net band */}
      <rect x="18" y="57" width="164" height="6" fill="rgba(30,20,10,0.7)" rx="1" />
      {/* net top cable */}
      <line x1="13" y1="57" x2="187" y2="57" stroke="#888" strokeWidth="1.5" />
      {/* net mesh */}
      <line x1="18" y1="57" x2="182" y2="63" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="5,4" />
      {/* selected glow */}
      {isSelected && (
        <rect x="5" y="5" width="190" height="110" rx="4"
          fill="rgba(245,184,0,0.18)" stroke="#F5B800" strokeWidth="2" />
      )}
    </svg>
  );
}

function CourtCard({ court, isSelected, onClick, disabled }) {
  return (
    <button
      type="button"
      className={`court-card${isSelected ? ' court-card--selected' : ''}${disabled ? ' court-card--disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="court-card-field">
        <CourtIllustration isSelected={isSelected} />
        {isSelected && <div className="court-card-check">✓</div>}
      </div>
      <div className="court-card-info">
        <span className="court-card-name">{court.name}</span>
        {isSelected && <span className="court-card-selected-label">Selecionada</span>}
      </div>
    </button>
  );
}

function SlotDetailPanel({ slot, onClose, onEdit, onDelete, onQuickReserve, currentUserId }) {
  if (!slot) return null;

  const { court, time, date, reservation } = slot;
  const isAvailable    = !reservation;
  const isOwn          = reservation?.user?.id === currentUserId;
  const slotDateTime   = new Date(`${format(date, 'yyyy-MM-dd')}T${time}:00`);
  const isPast         = slotDateTime < new Date();
  const endHour        = `${(parseInt(time, 10) + 1).toString().padStart(2, '0')}:00`;
  const formattedDate  = format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <>
      <div className="sdp-backdrop" onClick={onClose} />
      <div className="sdp-panel">
        {/* Header */}
        <div className="sdp-header">
          <div className="sdp-header-left">
            <span className="sdp-header-time">{time} – {endHour}</span>
            <span className={`sdp-badge ${isAvailable ? 'sdp-badge--available' : isOwn ? 'sdp-badge--own' : 'sdp-badge--reserved'}`}>
              {isAvailable ? 'Disponível' : isOwn ? 'Sua reserva' : 'Ocupado'}
            </span>
          </div>
          <button className="sdp-close" onClick={onClose} aria-label="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="sdp-body">
          <div className="sdp-info-row">
            <span className="sdp-info-icon">🏟️</span>
            <div>
              <span className="sdp-info-label">Quadra</span>
              <span className="sdp-info-value">{court.name}</span>
            </div>
          </div>
          <div className="sdp-info-row">
            <span className="sdp-info-icon">📅</span>
            <div>
              <span className="sdp-info-label">Data</span>
              <span className="sdp-info-value">{formattedDate}</span>
            </div>
          </div>
          <div className="sdp-info-row">
            <span className="sdp-info-icon">🕐</span>
            <div>
              <span className="sdp-info-label">Horário</span>
              <span className="sdp-info-value">{time} às {endHour}</span>
            </div>
          </div>
          {!isAvailable && (
            <div className="sdp-info-row">
              <span className="sdp-info-icon">👤</span>
              <div>
                <span className="sdp-info-label">Reservado por</span>
                <span className="sdp-info-value">
                  {isOwn ? 'Você' : reservation.user?.name || 'Outro associado'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Ações */}
        <div className="sdp-footer">
          {isAvailable && !isPast && (
            <button className="sdp-btn sdp-btn--primary" onClick={onQuickReserve}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
              Reservar este horário
            </button>
          )}
          {isAvailable && isPast && (
            <p className="sdp-msg sdp-msg--muted">Horário já passou.</p>
          )}
          {isOwn && !isPast && (
            <div className="sdp-btn-group">
              <button className="sdp-btn sdp-btn--edit" onClick={() => onEdit(reservation)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                </svg>
                Editar
              </button>
              <button className="sdp-btn sdp-btn--danger" onClick={() => onDelete(reservation.id)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
                Cancelar reserva
              </button>
            </div>
          )}
          {isOwn && isPast && (
            <p className="sdp-msg sdp-msg--muted">Reserva já realizada.</p>
          )}
          {!isAvailable && !isOwn && (
            <p className="sdp-msg sdp-msg--reserved">Este horário está ocupado por outro associado.</p>
          )}
        </div>
      </div>
    </>
  );
}

function ReservationsPage() {
  const { user, isAuthenticated } = useAuth();
  const [courts, setCourts] = useState([]);
  const [userReservations, setUserReservations] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourt, setSelectedCourt] = useState(null);
  const selectedCourtObj = courts.find((court) => court.id === selectedCourt);
  const [selectedTime, setSelectedTime] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingReservationId, setEditingReservationId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const formRef = useRef(null);
  const reservationsListRef = useRef(null);
  const errorRef = useRef(null);

  const RESERVATION_LIMIT = 4; 

  const setupApiAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Sessão expirada. Por favor, faça login novamente.');
      return false;
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return true;
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchData();
    } else {
      setError('Você precisa estar autenticado para acessar esta página.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  useEffect(() => {
    if (isEditing && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isEditing]);

  const fetchData = async () => {
    if (!setupApiAuthToken()) return;
    
    setLoading(true);
    try {
      const [userReservationsRes, allReservationsRes, courtsRes] = await Promise.all([
        api.get('/reservations/me'),
        api.get('/reservations'),
        api.get('/courts')
      ]);

      setUserReservations(userReservationsRes.data);       
      setAllReservations(allReservationsRes.data);
      setCourts(courtsRes.data);
      
    } catch (err) {
      const errorMessage = getApiErrorMessage(err);
      setError(`Erro ao carregar dados: ${errorMessage}`);
      
      if (err.response?.status === 401) {
        handleAuthError();
      }
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i < 22; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const isTimeSlotAvailable = (courtId, time) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const timeStr = `${dateStr}T${time}:00`;
    const reservationTimeDate = new Date(timeStr);

    if (isEditing) {
      return !allReservations.some(reservation => 
        reservation.court.id === courtId && 
        new Date(reservation.startTime).getTime() === reservationTimeDate.getTime() &&
        reservation.id !== editingReservationId 
      );
    }

    return !allReservations.some(reservation => 
      reservation.court.id === courtId && 
      new Date(reservation.startTime).getTime() === reservationTimeDate.getTime()
    );
  };

  const getApiErrorMessage = (err) => {
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    
    if (err.response?.status === 400) {
      return 'Requisição inválida. Verifique os dados e tente novamente.';
    } else if (err.response?.status === 401) {
      return 'Sessão expirada ou não autorizada.';
    } else if (err.response?.status === 403) {
      return 'Você não tem permissão para realizar esta operação.';
    } else if (err.response?.status === 404) {
      return 'Recurso não encontrado.';
    }
    
    return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
  };

  const handleAuthError = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/login?redirect=reservas';
  };

  const handleCreateReservation = async () => {
    if (!setupApiAuthToken()) return;
    
    if (!selectedCourt || !selectedTime) {
      setError('Por favor, selecione uma quadra e um horário.');
      return;
    }

    // Verificar limite de reservas
    if (userReservations.length >= RESERVATION_LIMIT) {
      setError(`Você atingiu o limite de ${RESERVATION_LIMIT} reservas simultâneas.`);
      return;
    }
  
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const startTime = new Date(`${dateStr}T${selectedTime}:00`);
    const isoStartTime = startTime.toISOString();
  
    try {
      setLoading(true);
      const response = await api.post('/reservations', {
        courtId: selectedCourt,
        startTime: isoStartTime
      });
  
      setUserReservations([...userReservations, response.data]);
      setAllReservations([...allReservations, response.data]);
      setSuccess('Reserva criada com sucesso!');
      
      setTimeout(() => {
        if (reservationsListRef.current) {
          reservationsListRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
      
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

  const handleUpdateReservation = async () => {
    if (!setupApiAuthToken()) return;
    
    if (!selectedTime) {
      setError('Por favor, selecione um horário.');
      return;
    }
  
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const startTime = new Date(`${dateStr}T${selectedTime}:00`);
    const isoStartTime = startTime.toISOString();
  
    try {
      setLoading(true);
      
      const response = await api.put(`/reservations/${editingReservationId}`, {
        startTime: isoStartTime
      });
  
      setUserReservations(userReservations.map(res => 
        res.id === editingReservationId ? response.data : res
      ));
      
      setAllReservations(allReservations.map(res => 
        res.id === editingReservationId ? response.data : res
      ));
      
      setSuccess('Reserva atualizada com sucesso!');
      
      setTimeout(() => {
        if (reservationsListRef.current) {
          reservationsListRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
      
      resetForm();
    } catch (err) {
      const errorMessage = getApiErrorMessage(err);
      setError(`Erro ao atualizar reserva: ${errorMessage}`);
      console.error('Erro ao atualizar reserva:', err);
      
      if (err.response?.status === 401) {
        handleAuthError();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReservation = async (id) => {
    if (!setupApiAuthToken()) return;
    
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return;
    }
  
    try {
      setLoading(true);
      
      await api.delete(`/reservations/${id}`);
      
      setUserReservations(userReservations.filter(res => res.id !== id));
      setAllReservations(allReservations.filter(res => res.id !== id));
      
      setSuccess('Reserva cancelada com sucesso!');
    } catch (err) {
      const errorMessage = getApiErrorMessage(err);
      setError(`Erro ao cancelar reserva: ${errorMessage}`);
      console.error('Erro ao deletar reserva:', err);
      
      if (err.response?.status === 401) {
        handleAuthError();
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditReservation = (reservation) => {
    const reservationDate = parseISO(reservation.startTime);
    
    setSelectedDate(reservationDate);
    setSelectedCourt(reservation.court.id);
    setSelectedTime(format(reservationDate, 'HH:mm'));
    setIsEditing(true);
    setEditingReservationId(reservation.id);
    
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const resetForm = () => {
    setSelectedCourt(null);
    setSelectedTime('');
    setIsEditing(false);
    setEditingReservationId(null);
    
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 3000);
  };

  const getNextDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      days.push(date);
    }
    
    return days;
  };

  const formatDate = (date) => {
    return format(date, "EEE, dd 'de' MMM", { locale: ptBR });
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleSlotClick = (court, time, reservation) => {
    setSelectedSlot({ court, time, date: selectedDate, reservation });
  };

  const handleQuickReserve = () => {
    if (!selectedSlot) return;
    setSelectedCourt(selectedSlot.court.id);
    setSelectedDate(selectedSlot.date);
    setSelectedTime(selectedSlot.time);
    setSelectedSlot(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // Cálculo do progresso de reservas
  const reservationProgress = (userReservations.length / RESERVATION_LIMIT) * 100;
  const remainingReservations = RESERVATION_LIMIT - userReservations.length;

  if (loading && userReservations.length === 0) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>Carregando reservas...</span>
      </div>
    );
  }

  return (
    <div className="reservations-container">
      {/* Hero banner */}
      <div className="reservations-header">
        <h1>
          <div className="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
            </svg>
          </div>
          Reservas de Quadras
        </h1>
        
        <div className="reservation-quota-card">
          <div className="quota-header">
            <span className="quota-label">Suas Reservas</span>
            <span className="quota-count">
              {userReservations.length}
              <span className="slash">/</span>
              {RESERVATION_LIMIT}
            </span>
          </div>
          <div className="quota-progress-bar">
            <div 
              className="quota-progress-fill" 
              style={{ width: `${reservationProgress}%` }}
            ></div>
          </div>
          <p className="quota-message">
            {remainingReservations > 0 
              ? `Você ainda pode fazer ${remainingReservations} ${remainingReservations === 1 ? 'reserva' : 'reservas'}`
              : 'Limite de reservas atingido'}
          </p>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="res-body">
      {/* Alertas de erro e sucesso */}
      <div ref={errorRef}>
        {error && (
          <div className="alert alert-error">
            <div className="alert-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
              </svg>
            </div>
            <div className="alert-content">{error}</div>
            <button className="close-btn" onClick={() => setError('')}>×</button>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            <div className="alert-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              </svg>
            </div>
            <div className="alert-content">{success}</div>
            <button className="close-btn" onClick={() => setSuccess('')}>×</button>
          </div>
        )}
      </div>
      
      {/* Botão de atualizar */}
      <div className="page-actions">
        <button 
          className="btn-refresh" 
          onClick={handleRefresh}
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
          {loading ? 'Atualizando...' : 'Atualizar dados'}
        </button>
      </div>
      
      {/* Grid principal com formulário e lista de reservas */}
      <div className="reservations-grid">
        {/* Formulário de criação/edição */}
        <div className="reservations-form" ref={formRef}>
          <h2>
            <div className="form-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
            </div>
            {isEditing ? 'Editar Reserva' : 'Nova Reserva'}
          </h2>
          
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
            <div className="court-selector">
              {courts.map((court) => (
                <CourtCard
                  key={court.id}
                  court={court}
                  isSelected={selectedCourt === court.id}
                  onClick={() => setSelectedCourt(court.id)}
                  disabled={isEditing}
                />
              ))}
            </div>
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
          
           <div className={`form-actions ${isEditing ? 'editing' : 'creating'}`}>
            <div className="form-actions-info">
              <span className="form-actions-title">
                {isEditing ? 'Editar reserva' : 'Nova reserva'}
              </span>

              <span className="form-actions-subtitle">
                {selectedCourtObj && selectedTime
                  ? `${selectedCourtObj.name} • ${selectedTime}h`
                  : 'Escolha a quadra e o horário antes de confirmar'}
              </span>
            </div>

            <div className="form-actions-buttons">
              {isEditing ? (
                <>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleUpdateReservation}
                    disabled={loading}
                  >
                    {loading ? 'Salvando alterações...' : 'Salvar alterações'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={resetForm}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleCreateReservation}
                  disabled={loading || !selectedCourt || !selectedTime}
                >
                  {loading ? 'Criando reserva...' : 'Confirmar reserva'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista de reservas do usuário */}
        <div className="user-reservations" ref={reservationsListRef}>
          <h2>
            <div className="list-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2.5 8a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0 6a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </div>
            Minhas Reservas
          </h2>
          
          {userReservations.length === 0 ? (
            <div className="no-reservations">
              <div className="no-reservations-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                </svg>
              </div>
              Você não possui reservas agendadas.
            </div>
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
                        <h3>
                          <div className="reservation-badge">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                            </svg>
                          </div>
                          {reservation.court.name}
                        </h3>
                        <p className="reservation-detail">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                          </svg>
                          <span className="label">Data:</span> 
                          {format(reservationDate, "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        <p className="reservation-detail">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                          </svg>
                          <span className="label">Horário:</span> 
                          {format(reservationDate, "HH:mm", { locale: ptBR })}
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
                          <span className="status">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                            </svg>
                            Finalizada
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
      
      {/* Visualização da agenda */}
      <div className="schedule-view">
        <h2>
          <div className="schedule-header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
            </svg>
          </div>
          Agenda de Reservas - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
        </h2>
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
                  
                  const isUserReservation = reservation?.user?.id === user?.id;
                  
                  const isSelected = selectedSlot?.court?.id === court.id && selectedSlot?.time === time;
                  return (
                    <div
                      key={`${court.id}-${time}`}
                      className={`time-block ${reservation ? (isUserReservation ? 'user-reserved' : 'reserved') : 'available'}${isSelected ? ' selected' : ''}`}
                      onClick={() => handleSlotClick(court, time, reservation)}
                    >
                      <span className="time-label">{time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>{/* /res-body */}
      <SlotDetailPanel
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onEdit={(res) => { handleEditReservation(res); setSelectedSlot(null); }}
        onDelete={(id) => { handleDeleteReservation(id); setSelectedSlot(null); }}
        onQuickReserve={handleQuickReserve}
        currentUserId={user?.id}
      />
    </div>
  );
}

export default ReservationsPage;
