import React from 'react';
import './Sobre.css';

function Sobre() {
  return (
    <div className="sobre-page">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="container">
          <h1>Sobre a AABB Jandaia do Sul</h1>
          <p>Conheça nossa história, missão e valores</p>
        </div>
      </section>

      {/* História Section */}
      <section className="historia-section">
        <div className="container">
          <div className="section-content">
            <div className="text-content">
              <h2 className="section-title">Nossa História</h2>
              <p>Fundada em 1978, a Associação Atlética Banco do Brasil (AABB) de Jandaia do Sul nasceu da iniciativa de funcionários do Banco do Brasil que desejavam criar um espaço de lazer, integração e prática esportiva para toda a comunidade bancária.</p>
              <p>Inicialmente com uma estrutura modesta, o clube foi crescendo ao longo dos anos graças ao empenho de suas sucessivas diretorias e ao apoio dos associados, tornando-se hoje uma referência de lazer e esporte na região.</p>
              <p>Em mais de quatro décadas de história, a AABB Jandaia do Sul já foi palco de inúmeros eventos esportivos, sociais e culturais, mantendo viva a tradição de proporcionar momentos inesquecíveis aos seus frequentadores.</p>
            </div>
            <div className="image-content">
              <img src="/images/history-image.jpg" alt="Inauguração Piscina" className="section-image" />
            </div>
          </div>
        </div>
      </section>

      {/* Missão e Valores */}
      <section className="missao-section">
        <div className="container">
          <h2 className="section-title">Missão, Visão e Valores</h2>
          
          <div className="valores-grid">
            <div className="valor-card">
              <div className="valor-icon">🎯</div>
              <h3>Missão</h3>
              <p>Promover o bem-estar e a qualidade de vida dos funcionários do Banco do Brasil, seus familiares e da comunidade por meio de atividades sociais, culturais, esportivas e de lazer.</p>
            </div>
            
            <div className="valor-card">
              <div className="valor-icon">👁️</div>
              <h3>Visão</h3>
              <p>Ser reconhecida como referência entre os clubes sociais e esportivos da região, oferecendo excelência em infraestrutura, atendimento e programação de eventos.</p>
            </div>
            
            <div className="valor-card">
              <div className="valor-icon">⭐</div>
              <h3>Valores</h3>
              <ul>
                <li>Ética e transparência</li>
                <li>Respeito à diversidade</li>
                <li>Sustentabilidade</li>
                <li>Compromisso com os associados</li>
                <li>Espírito de comunidade</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Diretoria */}
      <section className="diretoria-section">
        <div className="container">
          <h2 className="section-title">Diretoria Atual</h2>
          <p className="diretoria-intro">Nossa diretoria é formada por associados comprometidos com o desenvolvimento contínuo da AABB Jandaia do Sul.</p>
          
          <div className="diretoria-grid">
            <div className="diretor-card">
              <div className="diretor-avatar">
                <img src="/images/default-avatar.png" alt="Presidente" className="diretor-img" />
              </div>
              <h3>Claudemir Foppa</h3>
              <p className="diretor-cargo">Presidente</p>
              <p>Gestão 2024-2027</p>
            </div>
            
            <div className="diretor-card">
              <div className="diretor-avatar">
                <img src="/images/default-avatar.png" alt="Vice-Presidente" className="diretor-img" />
              </div>
              <h3>José Carlos Quintanilha</h3>
              <p className="diretor-cargo">Vice-Presidente</p>
              <p>Gestão 2024-2027</p>
            </div>
            
            <div className="diretor-card">
              <div className="diretor-avatar">
                <img src="/images/default-avatar.png" alt="Diretor de Esportes" className="diretor-img" />
              </div>
              <h3>Pedro Santos</h3>
              <p className="diretor-cargo">Diretor de Esportes</p>
              <p>Gestão 2024-2027</p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="numeros-section">
        <div className="container">
          <h2 className="section-title">AABB em Números</h2>
          
          <div className="numeros-grid">
            <div className="numero-card">
              <div className="numero">40+</div>
              <p>Anos de história</p>
            </div>
            
            <div className="numero-card">
              <div className="numero">500+</div>
              <p>Famílias associadas</p>
            </div>
            
            <div className="numero-card">
              <div className="numero">20.000m²</div>
              <p>De área total</p>
            </div>
            
            <div className="numero-card">
              <div className="numero">12</div>
              <p>Modalidades esportivas</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Sobre;