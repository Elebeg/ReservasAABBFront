import React from 'react';
import './Esportes.css';

function Esportes() {
  return (
    <div className="esportes">
      <section className="esportes-header">
        <div className="container">
          <h1>Esporte é Vida, Movimento e Conexão</h1>
          <p>Na AABB Jandaia do Sul, cada modalidade é um convite ao bem-estar e à amizade. Escolha a sua e venha fazer parte!</p>
        </div>
      </section>

      <section className="esportes-lista">
        <div className="container esportes-grid">

          <div className="esportes-card">
            <img src="/images/esporte-futebol.jpg" alt="Futebol Society" />
            <h3>Futebol Suiço</h3>
            <p>Nosso campo de grama reúne craques de todas as idades. Campeonatos internos e jogos amistosos mantêm a rivalidade saudável e a amizade em alta.</p>
          </div>

          <div className="esportes-card">
            <img src="/images/esporte-volei.jpg" alt="Vôlei de Areia" />
            <h3>Vôlei de Areia</h3>
            <p>Sol, areia e espírito esportivo! A quadra de vôlei de areia é palco de diversão e competição para jovens e adultos.</p>
          </div>

          <div className="esportes-card">
            <img src="/images/esporte-natacao.jpg" alt="Natação" />
            <h3>Natação</h3>
            <p>Além do lazer, a piscina é espaço para aulas, treinos e práticas esportivas — perfeitas para manter corpo e mente em equilíbrio.</p>
          </div>

          <div className="esportes-card">
            <img src="/images/esporte-tenis.jpg" alt="Beach Tennis" />
            <h3>Beach Tennis</h3>
            <p>Uma das modalidades que mais cresce no Brasil também tem vez aqui! Jogue beach tennis em quadras bem cuidadas e iluminadas.</p>
          </div>

        </div>
      </section>
    </div>
  );
}

export default Esportes;
