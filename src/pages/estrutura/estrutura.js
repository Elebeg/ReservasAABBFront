import React from 'react';
import { Link } from 'react-router-dom';
import { ClubMap } from '../../components/ClubMap';
import './estrutura.css';

const espacos = [
  { img: '/images/piscina.webp',    titulo: 'Piscinas',           desc: 'Piscinas adulto e infantil com área de descanso e salva-vidas.' },
  { img: '/images/quadras.webp',    titulo: 'Quadras Esportivas', desc: 'Beach tennis, vôlei e a quadra poliesportiva coberta.' },
  { img: '/images/salao.webp',      titulo: 'Salão de Festas',    desc: 'Espaço para confraternizações e eventos sociais do clube.' },
  { img: '/images/area-verde.webp', titulo: 'Área Verde',         desc: 'Mais de 20.000m² de natureza, bosque e churrasqueiras.' },
];

const plantas = [
  { num: 'I',   label: 'Conjunto aquático',         desc: 'Piscina adulto · piscina infantil rasa · solário' },
  { num: 'II',  label: 'Quadras de beach tennis',   desc: 'Três quadras de areia · iluminadas à noite' },
  { num: 'III', label: 'Campo de futebol suíço',    desc: 'Gramado natural · medidas oficiais · holofotes' },
  { num: 'IV',  label: 'Quadra poliesportiva',      desc: 'Piso para vôlei e futsal · cobertura' },
  { num: 'V',   label: 'Salão de festas',           desc: 'Para eventos do clube e dos sócios · cozinha' },
  { num: 'VI',  label: 'Bosque & churrasqueiras',   desc: 'Churrasqueiras numeradas · área verde · caminhada' },
  { num: 'VII', label: 'Salão dos sócios',          desc: 'Sinuca · mesas de jogos · convivência' },
];

function Estrutura() {
  return (
    <div className="clube-page clube-estrutura">

      {/* Hero */}
      <section className="clube-hero">
        <div className="wrap">
          <span className="clube-hero-eyebrow">O Clube · Estrutura</span>
          <h1 className="clube-hero-title">Vinte mil metros<br />de <em>tradição</em>.</h1>
          <p className="clube-hero-sub">
            Uma infraestrutura completa, voltada ao lazer, ao esporte e à convivência —
            tudo no mesmo terreno, do jeito que o sócio gosta.
          </p>
        </div>
      </section>

      {/* Galeria de espaços */}
      <section className="estr-galeria">
        <div className="wrap">
          <div className="clube-eyebrow"><span className="clube-bn">01</span><span>Espaços do clube</span></div>
          <h2 className="clube-section-title">Lazer para a <em>família toda</em>.</h2>

          <div className="galeria-grid">
            {espacos.map((e) => (
              <article className="galeria-card" key={e.titulo}>
                <div className="galeria-img">
                  <img src={e.img} alt={e.titulo} onError={(ev) => { ev.target.style.opacity = 0; }} />
                </div>
                <div className="galeria-body">
                  <h3>{e.titulo}</h3>
                  <p>{e.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Planta + placas */}
      <section className="estr-planta">
        <div className="wrap planta-grid">
          <div className="planta-text">
            <div className="clube-eyebrow clube-eyebrow--gold"><span className="clube-bn">02</span><span>A planta da sede</span></div>
            <h2 className="clube-section-title">Tudo a um<br /><em>passo</em> do outro.</h2>
            <p className="planta-lede">
              Da piscina ao salão, do campo ao bosque das churrasqueiras: a sede própria
              reúne sete grandes áreas conectadas pela mesma alameda.
            </p>

            <div className="planta-plates">
              {plantas.map((p) => (
                <div className="planta-plate" key={p.num}>
                  <span className="planta-num">{p.num}</span>
                  <span className="planta-label">{p.label}</span>
                  <span className="planta-desc">{p.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="planta-map">
            <ClubMap />
            <Link to="/register" className="btn-primary planta-cta">
              <span>Venha conhecer</span><span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Estrutura;
