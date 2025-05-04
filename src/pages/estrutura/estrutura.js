import React from 'react';
import './estrutura.css';

function Estrutura() {
  return (
    <div className="estrutura">
      <section className="estrutura-header">
        <div className="container">
          <h1>Conheça Nossa Estrutura</h1>
          <p>Uma infraestrutura completa voltada ao lazer, esporte e convivência social.</p>
        </div>
      </section>

      <section className="estrutura-lista">
        <div className="container estrutura-grid">
          <div className="estrutura-card">
            <img src="/images/piscina.webp" alt="Piscinas" />
            <h3>Piscinas</h3>
            <p>Piscinas adulto e infantil com área de descanso e salva-vidas.</p>
          </div>
          <div className="estrutura-card">
            <img src="/images/quadras.webp" alt="Quadras Esportivas" />
            <h3>Quadras Esportivas</h3>
            <p>Futebol, vôlei, beach tennis e outras modalidades.</p>
          </div>
          <div className="estrutura-card">
            <img src="/images/salao.webp" alt="Salão de Festas" />
            <h3>Salão de Festas</h3>
            <p>Espaço climatizado, ideal para confraternizações e eventos sociais.</p>
          </div>
          <div className="estrutura-card">
            <img src="/images/area-verde.webp" alt="Área Verde" />
            <h3>Área Verde</h3>
            <p>Mais de 20.000m² de natureza para relaxar e curtir com a família.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Estrutura;
