import React from 'react';
import { Link } from 'react-router-dom';
import './Eventos.css';

const eventos = [
  {
    id: 1,
    titulo: 'Torneio de Beach Tennis',
    descricao: 'Torneio aberto para duplas masculinas e femininas, nas três quadras de areia do clube.',
    dia: '17',
    mes: 'Mai',
    tag: 'Esporte',
    cta: { label: 'Ver campeonato', to: '/campeonato' },
  },
  {
    id: 2,
    titulo: 'Festa Junina da AABB',
    descricao: 'Tradicional festa junina com comidas típicas, música ao vivo e brincadeiras para toda a família.',
    dia: '22',
    mes: 'Jun',
    tag: 'Para a família',
    cta: null,
  },
];

const Eventos = () => {
  return (
    <div className="clube-page clube-eventos">

      {/* Hero */}
      <section className="clube-hero">
        <div className="wrap">
          <span className="clube-hero-eyebrow">Agenda do clube</span>
          <h1 className="clube-hero-title">Próximos <em>eventos</em>.</h1>
          <p className="clube-hero-sub">
            Torneios, festas e encontros que fazem do fim de semana no clube o ponto alto
            da semana. Marque na agenda e traga a família.
          </p>
        </div>
      </section>

      {/* Lista */}
      <section className="eventos-lista">
        <div className="wrap">
          {eventos.length === 0 ? (
            <div className="eventos-vazio">
              <p>Nenhum evento programado no momento.</p>
              <span>Fique de olho — a próxima data vem aí.</span>
            </div>
          ) : (
            <div className="eventos-grid">
              {eventos.map((evento) => (
                <article className="evento-ticket" key={evento.id}>
                  <div className="evento-data">
                    <span className="evento-dia">{evento.dia}</span>
                    <span className="evento-mes">{evento.mes}</span>
                  </div>
                  <div className="evento-perfuro" aria-hidden="true" />
                  <div className="evento-info">
                    {evento.tag && <span className="evento-tag">{evento.tag}</span>}
                    <h3>{evento.titulo}</h3>
                    <p>{evento.descricao}</p>
                    {evento.cta && (
                      <Link to={evento.cta.to} className="evento-link">
                        {evento.cta.label} <span className="btn-arrow">→</span>
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="eventos-rodape">
            <span className="eventos-rodape-eye">Programação</span>
            <p>
              A agenda completa é divulgada nos canais do clube. Acompanhe pelo
              {' '}
              <a href="https://www.instagram.com/_aabbjandaia/" target="_blank" rel="noopener noreferrer">Instagram</a>
              {' '}e na Secretaria.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Eventos;
