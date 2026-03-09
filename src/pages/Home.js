import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const auth = useAuth();
  const userFromContext = auth?.user || auth?.currentUser || auth?.loggedUser || null;
  const isAuthenticated = !!userFromContext;

  // Pega só o primeiro nome, se existir
  const firstName = userFromContext?.name
    ? userFromContext.name.split(' ')[0]
    : null;

  const tournamentData = useTournamentPreview();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          {isAuthenticated ? (
            <>
              <h1>
                Bem-vindo{firstName ? `, ${firstName}` : ''} 👋
              </h1>
              <h2>Sistema de Reservas de Quadras - AABB Jandaia do Sul</h2>
              <p>
                Agora você tem acesso ao sistema exclusivo de reservas. Escolha a quadra,
                o dia e o horário que preferir e organize seus jogos com facilidade.
              </p>
              <div className="hero-cta-cards">
                <Link to="/reservas" className="hero-cta-card">
                  <span className="hero-cta-icon">🎾</span>
                  <span className="hero-cta-title">Reservar Quadra</span>
                  <span className="hero-cta-desc">Escolha o dia e horário da sua partida</span>
                  <span className="hero-cta-btn">Reservar agora →</span>
                </Link>
                <Link to="/campeonato" className="hero-cta-card hero-cta-card--yellow">
                  <span className="hero-cta-icon">🏆</span>
                  <span className="hero-cta-title">Campeonato</span>
                  <span className="hero-cta-desc">Veja as atualizações dos Campeonatos</span>
                  <span className="hero-cta-btn">Ver campeonato →</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1>Bem-vindo à AABB Jandaia do Sul</h1>
              <h2>Associação Atlética Banco do Brasil</h2>
              <p>
                Esporte, lazer e cultura para toda a família em um dos melhores clubes da
                região!
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="btn-primary">
                  Registre-se
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Activities Section (mantém igual para os dois casos) */}
      <section className="activities">
        <div className="container">
          <h2 className="section-title">Nossas Atividades</h2>
          <div className="activities-grid">
            <div className="activity-card">
              <div className="activity-icon">🏊‍♂️</div>
              <h3>Natação</h3>
              <p>
                Piscinas adulto e infantil climatizadas. Aulas e atividades aquáticas para
                todas as idades.
              </p>
            </div>
            <div className="activity-card">
              <div className="activity-icon">🏖️</div>
              <h3>Beach Tennis</h3>
              <p>Quadras profissionais de areia com iluminação. Torneios mensais.</p>
            </div>
            <div className="activity-card">
              <div className="activity-icon">⚽</div>
              <h3>Futebol</h3>
              <p>
                Campo suíço oficial gramado com iluminação noturna. Campeonatos internos
                aos finais de semana.
              </p>
            </div>
            <div className="activity-card">
              <div className="activity-icon">🏐</div>
              <h3>Vôlei</h3>
              <p>
                Quadras de areia e poliesportiva cobertas para prática em qualquer clima.
              </p>
            </div>
          </div>
          <div className="more-activities">
            <Link to="/esportes" className="btn-secondary">
              Ver mais atividades
            </Link>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="events">
        <div className="container">
          <h2 className="section-title">Próximos Eventos</h2>
          <div className="events-slider">
            {tournamentData && <TournamentEventCard data={tournamentData} />}
            <div className="event-card">
              <div className="event-date">
                <span className="day">15</span>
                <span className="month">Jun</span>
              </div>
              <div className="event-info">
                <h3>Torneio de Beach Tennis</h3>
                <p>Torneio aberto para duplas masculinas, femininas e mistas.</p>
                <Link
                  to="/eventos/torneio-beach-tennis"
                  className="btn-text"
                >
                  Saiba mais
                </Link>
              </div>
            </div>
            <div className="event-card">
              <div className="event-date">
                <span className="day">22</span>
                <span className="month">Jun</span>
              </div>
              <div className="event-info">
                <h3>Festa Junina AABB</h3>
                <p>
                  Tradicional festa junina com comidas típicas, música ao vivo e
                  brincadeiras para toda família.
                </p>
                <Link to="/eventos/festa-junina" className="btn-text">
                  Saiba mais
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">Sobre a AABB Jandaia do Sul</h2>
              <p>
                A Associação Atlética Banco do Brasil (AABB) de Jandaia do Sul é um clube
                recreativo que proporciona momentos de lazer, esporte e integração para os
                funcionários do Banco do Brasil, seus familiares e comunidade.
              </p>
              <p>
                Com uma infraestrutura completa, a AABB Jandaia do Sul oferece diversas
                atividades para todas as idades, promovendo qualidade de vida e bem-estar
                desde 1978.
              </p>
              <p>
                Nossa sede conta com mais de 20.000m² de área verde, piscinas, quadras
                esportivas, salão de festas e muito mais para o seu lazer.
              </p>
              <Link to="/sobre" className="btn-secondary">
                Saiba mais
              </Link>
            </div>
            <div className="about-image">
              <img
                src={'/images/Piscina_1.webp'}
                alt="Vista aérea da AABB Jandaia do Sul"
                className="clube-img"
              />
              <div className="placeholder-image"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">O que dizem nossos associados</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-quote">
                "A AABB Jandaia do Sul é o melhor lugar para passar os finais de semana
                com a família. As crianças adoram a piscina e os adultos têm várias
                opções de lazer."
              </div>
              <div className="testimonial-author">
                - Maria Souza, associada há 5 anos
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">
                "As aulas de natação são excelentes! Os professores são muito
                atenciosos e a estrutura é de primeira qualidade."
              </div>
              <div className="testimonial-author">
                - João Silva, associado há 3 anos
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">
                "Os eventos da AABB são sempre muito bem organizados. A festa junina é
                imperdível!"
              </div>
              <div className="testimonial-author">
                - Ana Costa, associada há 7 anos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          {isAuthenticated ? (
            <>
              <h2>Pronto para reservar sua próxima partida?</h2>
              <p>
                Use o sistema de reservas para garantir o melhor horário nas quadras de
                beach tennis. Acompanhe e gerencie todas as suas
                reservas em um só lugar.
              </p>
              <div className="cta-buttons">
                <Link to="/reservas" className="btn-secondary">
                  Reservar agora
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2>Reservas de quadras para Associados</h2>
              <p>Faça login para reservar seu horário em nossas quadras.</p>
              <div className="cta-buttons">
                <Link to="/login" className="btn-primary">
                  Login
                </Link>
                <Link to="/register" className="btn-secondary">
                  Registre-se
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;