import React from 'react';
import { Link } from 'react-router-dom';
import './Esportes.css';

const modalidades = [
  {
    num: '09',
    cor: 'blue',
    nome: 'Futebol Suíço',
    img: '/images/esporte-futebol.jpg',
    desc: 'Nosso campo de grama reúne craques de todas as idades. Campeonatos internos e jogos amistosos mantêm a rivalidade saudável e a amizade em alta.',
    local: 'Campo oficial gramado · holofotes',
    quando: 'Sáb pelada · Dom oficial',
  },
  {
    num: '06',
    cor: 'gold',
    nome: 'Vôlei de Areia',
    img: '/images/esporte-volei.jpg',
    desc: 'Sol, areia e espírito esportivo! A quadra de vôlei de areia é palco de diversão e competição para jovens e adultos.',
    local: 'Quadra de areia e coberta',
    quando: 'Seg · Qua · Sex',
  },
  {
    num: '07',
    cor: 'blue',
    nome: 'Natação',
    img: '/images/esporte-natacao.jpg',
    desc: 'Além do lazer, a piscina é espaço para aulas, treinos e práticas esportivas — perfeitas para manter corpo e mente em equilíbrio.',
    local: 'Piscinas adulto e infantil',
    quando: 'A partir dos 3 anos',
  },
  {
    num: '10',
    cor: 'red',
    nome: 'Beach Tennis',
    img: '/images/esporte-tenis.jpg',
    desc: 'Uma das modalidades que mais cresce no Brasil também tem vez aqui! Jogue beach tennis em quadras bem cuidadas e iluminadas.',
    local: 'Três quadras de areia',
    quando: 'Reserva online · Ter a Dom',
  },
];

function Esportes() {
  return (
    <div className="clube-page clube-esportes">

      {/* Hero */}
      <section className="clube-hero">
        <div className="wrap">
          <span className="clube-hero-eyebrow">Departamento de Esportes</span>
          <h1 className="clube-hero-title">Esporte é vida,<br /><em>movimento</em> e conexão.</h1>
          <p className="clube-hero-sub">
            Na AABB Jandaia do Sul, cada modalidade é um convite ao bem-estar e à amizade.
            Escolha a sua e venha fazer parte da turma.
          </p>
        </div>
      </section>

      {/* Modalidades */}
      <section className="esportes-lista">
        <div className="wrap">
          {modalidades.map((m, i) => (
            <article className={`esporte-row ${i % 2 === 1 ? 'esporte-row--flip' : ''}`} key={m.num}>
              <div className="esporte-media">
                <div className={`esporte-frame esporte-frame--${m.cor}`}>
                  <img
                    src={m.img}
                    alt={m.nome}
                    onError={(e) => { e.target.style.opacity = 0; }}
                  />
                  <span className={`esporte-num esporte-num--${m.cor}`}>{m.num}</span>
                </div>
              </div>
              <div className="esporte-body">
                <h2 className="esporte-nome">{m.nome}</h2>
                <p className="esporte-desc">{m.desc}</p>
                <div className="esporte-meta">
                  <div className="em-item">
                    <span className="em-label">Onde</span>
                    <span className="em-value">{m.local}</span>
                  </div>
                  <div className="em-item">
                    <span className="em-label">Quando</span>
                    <span className="em-value">{m.quando}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="esportes-cta">
        <div className="wrap">
          <h2 className="clube-section-title clube-section-title--light">
            Bora <em>jogar</em>?
          </h2>
          <p className="esportes-cta-sub">
            Sócio reserva a quadra pelo app e a família toda treina junta — sem cobrança
            por modalidade.
          </p>
          <div className="esportes-cta-row">
            <Link to="/reservas" className="btn-primary btn-primary--gold">
              <span>Reservar quadra</span><span className="btn-arrow">→</span>
            </Link>
            <Link to="/register" className="btn-ghost btn-ghost--light">Quero ser sócio →</Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Esportes;
