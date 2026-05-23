import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { format, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './Reservas.css';

function CourtCard({ court, isSelected, onClick, disabled }) {
  return (
    <button
      type="button"
      className={`court-card${isSelected ? ' is-selected' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="court-card-sand" aria-hidden="true" />
      <span className="court-card-name">{court.name}</span>
      <span className="court-card-state">{isSelected ? 'Selecionada' : 'Selecionar'}</span>
    </button>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);

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
        api.get('/courts'),
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
        startTime: isoStartTime,
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
        startTime: isoStartTime,
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
      days.push(addDays(today, i));
    }

    return days;
  };

  const formatDate = (date) => format(date, "EEE, dd/MM", { locale: ptBR });

  const handleRefresh = () => {
    fetchData();
  };

  // Clicar num horário livre da agenda → preenche o formulário (sem drawer)
  const handleSlotClick = (court, time, reservation) => {
    if (reservation || isEditing) return;
    const slotDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${time}:00`);
    if (slotDateTime < new Date()) return;

    setSelectedCourt(court.id);
    setSelectedTime(time);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const reservationProgress = (userReservations.length / RESERVATION_LIMIT) * 100;
  const remainingReservations = RESERVATION_LIMIT - userReservations.length;

  if (loading && userReservations.length === 0) {
    return (
      <div className="res-loading">
        <div className="res-loading-spinner" />
        <span>Carregando reservas...</span>
      </div>
    );
  }

  return (
    <div className="reservations-container">

      {/* Hero */}
      <header className="res-hero">
        <div className="res-hero-inner">
          <div className="res-hero-text">
            <span className="res-eyebrow">Área do sócio</span>
            <h1>Reservar quadra</h1>
            <p>Escolha o dia, a quadra e o horário. Você pode manter até {RESERVATION_LIMIT} reservas ativas.</p>
          </div>

          <div className="res-quota">
            <div className="res-quota-top">
              <span className="res-quota-label">Suas reservas</span>
              <span className="res-quota-count">{userReservations.length}<i>/{RESERVATION_LIMIT}</i></span>
            </div>
            <div className="res-quota-bar">
              <div className="res-quota-fill" style={{ width: `${reservationProgress}%` }} />
            </div>
            <span className="res-quota-msg">
              {remainingReservations > 0
                ? `Você ainda pode fazer ${remainingReservations} ${remainingReservations === 1 ? 'reserva' : 'reservas'}`
                : 'Limite de reservas atingido'}
            </span>
          </div>
        </div>
      </header>

      <div className="res-body">
        {/* Alertas */}
        <div ref={errorRef}>
          {error && (
            <div className="res-alert res-alert--error">
              <span>{error}</span>
              <button className="res-alert-close" onClick={() => setError('')} aria-label="Fechar">×</button>
            </div>
          )}
          {success && (
            <div className="res-alert res-alert--success">
              <span>{success}</span>
              <button className="res-alert-close" onClick={() => setSuccess('')} aria-label="Fechar">×</button>
            </div>
          )}
        </div>

        <div className="res-toolbar">
          <button className="res-refresh" onClick={handleRefresh} disabled={loading}>
            {loading ? 'Atualizando…' : 'Atualizar dados'}
          </button>
        </div>

        {/* Grid: formulário + lista */}
        <div className="res-grid">

          {/* Formulário */}
          <section className="res-card res-form" ref={formRef}>
            <h2 className="res-card-title">{isEditing ? 'Editar reserva' : 'Nova reserva'}</h2>

            <div className="res-field">
              <label>Data</label>
              <div className="res-dates">
                {getNextDays().map((day) => (
                  <button
                    key={day.toISOString()}
                    type="button"
                    className={`res-date${selectedDate.toDateString() === day.toDateString() ? ' is-active' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    {formatDate(day)}
                  </button>
                ))}
              </div>
            </div>

            <div className="res-field">
              <label>Quadra</label>
              <div className="res-courts">
                {courts.map((court) => (
                  <CourtCard
                    key={court.id}
                    court={court}
                    isSelected={selectedCourt === court.id}
                    onClick={() => !isEditing && setSelectedCourt(court.id)}
                    disabled={isEditing}
                  />
                ))}
              </div>
            </div>

            {selectedCourt && (
              <div className="res-field">
                <label>Horário</label>
                <div className="res-times">
                  {generateTimeSlots().map((time) => {
                    const isAvailable = isEditing ? true : isTimeSlotAvailable(selectedCourt, time);
                    return (
                      <button
                        key={time}
                        type="button"
                        className={`res-time${selectedTime === time ? ' is-active' : ''}${!isAvailable ? ' is-off' : ''}`}
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

            <div className="res-confirm">
              <div className="res-confirm-info">
                <span className="res-confirm-title">{isEditing ? 'Editar reserva' : 'Resumo'}</span>
                <span className="res-confirm-sub">
                  {selectedCourtObj && selectedTime
                    ? `${selectedCourtObj.name} · ${format(selectedDate, 'dd/MM')} · ${selectedTime}h`
                    : 'Escolha a quadra e o horário'}
                </span>
              </div>
              <div className="res-confirm-actions">
                {isEditing ? (
                  <>
                    <button className="res-btn res-btn--primary" onClick={handleUpdateReservation} disabled={loading}>
                      {loading ? 'Salvando…' : 'Salvar'}
                    </button>
                    <button type="button" className="res-btn res-btn--ghost" onClick={resetForm}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    className="res-btn res-btn--primary"
                    onClick={handleCreateReservation}
                    disabled={loading || !selectedCourt || !selectedTime}
                  >
                    {loading ? 'Criando…' : 'Confirmar reserva'}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Minhas reservas */}
          <section className="res-card res-list" ref={reservationsListRef}>
            <h2 className="res-card-title">Minhas reservas</h2>

            {userReservations.length === 0 ? (
              <div className="res-empty">Você ainda não possui reservas agendadas.</div>
            ) : (
              <ul className="res-items">
                {userReservations
                  .slice()
                  .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                  .map((reservation) => {
                    const reservationDate = parseISO(reservation.startTime);
                    const isPast = reservationDate < new Date();

                    return (
                      <li key={reservation.id} className={`res-item${isPast ? ' is-past' : ''}`}>
                        <div className="res-item-main">
                          <span className="res-item-court">{reservation.court.name}</span>
                          <span className="res-item-when">
                            {format(reservationDate, "dd/MM/yyyy", { locale: ptBR })}
                            <i>·</i>
                            {format(reservationDate, "HH:mm", { locale: ptBR })}
                          </span>
                        </div>

                        {isPast ? (
                          <span className="res-item-tag">Finalizada</span>
                        ) : (
                          <div className="res-item-actions">
                            <button className="res-ibtn" onClick={() => handleEditReservation(reservation)}>
                              Editar
                            </button>
                            <button className="res-ibtn res-ibtn--danger" onClick={() => setCancelTarget(reservation)}>
                              Cancelar
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
              </ul>
            )}
          </section>
        </div>

        {/* Agenda */}
        <section className="res-card res-schedule">
          <div className="res-schedule-head">
            <h2 className="res-card-title">
              Agenda · {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h2>
            <div className="res-legend">
              <span><i className="res-dot res-dot--free" />Livre</span>
              <span><i className="res-dot res-dot--mine" />Sua reserva</span>
              <span><i className="res-dot res-dot--busy" />Ocupado</span>
            </div>
          </div>

          <div className="res-schedule-body">
            {courts.map((court) => (
              <div key={court.id} className="res-row">
                <span className="res-row-name">{court.name}</span>
                <div className="res-slots">
                  {generateTimeSlots().map((time) => {
                    const dateStr = format(selectedDate, 'yyyy-MM-dd');
                    const slotDate = new Date(`${dateStr}T${time}:00`);

                    const reservation = allReservations.find(res =>
                      res.court.id === court.id &&
                      new Date(res.startTime).getTime() === slotDate.getTime()
                    );

                    const isMine = reservation?.user?.id === user?.id;
                    const isPast = slotDate < new Date();
                    const isSel = !isEditing && selectedCourt === court.id && selectedTime === time;

                    let state = 'free';
                    if (reservation) state = isMine ? 'mine' : 'busy';

                    return (
                      <button
                        key={`${court.id}-${time}`}
                        type="button"
                        className={`res-slot res-slot--${state}${isSel ? ' is-sel' : ''}${isPast && !reservation ? ' is-past' : ''}`}
                        onClick={() => handleSlotClick(court, time, reservation)}
                        disabled={!!reservation || isPast}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <p className="res-hint">Toque em um horário livre para preenchê-lo no formulário acima.</p>
        </section>
      </div>

      {/* Modal de cancelamento */}
      {cancelTarget && (
        <div className="res-modal-backdrop" onClick={() => setCancelTarget(null)}>
          <div className="res-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="res-modal-head">
              <span className="res-modal-eyebrow">Cancelar reserva</span>
              <h3>Tem certeza?</h3>
            </div>
            <div className="res-modal-body">
              <p>O horário será liberado para outros sócios. Esta ação não pode ser desfeita.</p>
              <div className="res-modal-card">
                <span className="res-modal-court">{cancelTarget.court.name}</span>
                <span className="res-modal-when">
                  {format(parseISO(cancelTarget.startTime), "EEEE, dd/MM 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
            <div className="res-modal-actions">
              <button className="res-btn res-btn--ghost-ink" onClick={() => setCancelTarget(null)} disabled={loading}>
                Voltar
              </button>
              <button
                className="res-btn res-btn--danger"
                onClick={() => { handleDeleteReservation(cancelTarget.id); setCancelTarget(null); }}
                disabled={loading}
              >
                {loading ? 'Cancelando…' : 'Cancelar reserva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReservationsPage;
