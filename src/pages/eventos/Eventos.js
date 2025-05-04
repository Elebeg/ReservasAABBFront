import React from 'react';
import { Link } from 'react-router-dom';
import './Eventos.css';

const eventos = [
  {
    id: 1,
    titulo: 'Torneio de Beach Tennis',
    descricao: 'Torneio aberto para duplas masculinas, femininas e mistas.',
    dia: '15',
    mes: 'Jun',
    link: '/eventos/torneio-beach-tennis'
  },
  {
    id: 2,
    titulo: 'Festa Junina AABB',
    descricao: 'Tradicional festa junina com comidas típicas, música ao vivo e brincadeiras para toda família.',
    dia: '22',
    mes: 'Jun',
    link: '/eventos/festa-junina'
  }
];

const Eventos = () => {
  return (
    <section className="eventos">
      <div className="container">
        <h2 className="section-title">Próximos Eventos</h2>

        {eventos.length === 0 ? (
          <div className="sem-eventos">
            <p>Atualmente não temos eventos programados.<br />Fique atento às novidades!</p>
          </div>
        ) : (
          <div className="events-slider">
            {eventos.map((evento) => (
              <div className="event-card" key={evento.id}>
                <div className="event-date">
                  <span className="day">{evento.dia}</span>
                  <span className="month">{evento.mes}</span>
                </div>
                <div className="event-info">
                  <h3>{evento.titulo}</h3>
                  <p>{evento.descricao}</p>
                  <Link to={evento.link} className="btn-text">Saiba mais</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Eventos;
