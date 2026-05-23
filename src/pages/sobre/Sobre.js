import React from 'react';
import { Link } from 'react-router-dom';
import './Sobre.css';

const diretoria = [
  { nome: 'Claudemir Foppa', cargo: 'Presidente' },
  { nome: 'José Carlos Quintanilha', cargo: 'Vice-Presidente' },
  { nome: 'André Saddi', cargo: 'Diretor de Esportes' },
];

const numeros = [
  { n: '1978', l: 'Ano de fundação' },
  { n: '500+', l: 'Famílias associadas' },
  { n: '20 mil', l: 'Metros quadrados' },
  { n: '4', l: 'Modalidades esportivas' },
];

function Sobre() {
  return (
    <div className="clube-page clube-sobre">

      {/* Hero */}
      <section className="clube-hero">
        <div className="wrap">
          <span className="clube-hero-eyebrow">O Clube · Desde 1978</span>
          <h1 className="clube-hero-title">Sobre a <em>AABB</em><br />Jandaia do Sul.</h1>
          <p className="clube-hero-sub">
            Um clube de bairro feito de gente: história, missão e as pessoas que mantêm
            as portas abertas para a família bancária e a comunidade.
          </p>
        </div>
      </section>

      {/* História */}
      <section className="sobre-historia">
        <div className="wrap historia-grid">
          <div className="historia-text">
            <div className="clube-eyebrow"><span className="clube-bn">01</span><span>Nossa história</span></div>
            <h2 className="clube-section-title">Quase meio século<br />no <em>mesmo terreno</em>.</h2>
            <p className="sobre-lede">
              Fundada em 1978 por funcionários do Banco do Brasil que queriam um espaço de
              lazer, integração e esporte para toda a comunidade bancária.
            </p>
            <p>
              Começou com uma estrutura modesta e cresceu ao longo das décadas graças ao
              empenho das sucessivas diretorias e ao apoio dos associados — tornando-se uma
              referência de lazer e esporte na região.
            </p>
            <p>
              Em mais de quatro décadas, a AABB Jandaia do Sul foi palco de inúmeros eventos
              esportivos, sociais e culturais, mantendo viva a tradição de proporcionar
              momentos inesquecíveis a quem frequenta o clube.
            </p>
          </div>
          <div className="historia-media">
            <div className="historia-frame">
              <img src="/images/history-image.jpg" alt="História da AABB Jandaia do Sul" />
            </div>
            <span className="historia-cap">Arquivo do clube · sede própria</span>
          </div>
        </div>
      </section>

      {/* Missão, Visão e Valores */}
      <section className="sobre-principios">
        <div className="wrap">
          <div className="clube-eyebrow clube-eyebrow--light"><span className="clube-bn">02</span><span>Princípios do clube</span></div>
          <h2 className="clube-section-title clube-section-title--light">Missão, visão<br />e <em>valores</em>.</h2>

          <div className="principios-grid">
            <article className="principio-card">
              <span className="principio-num">I</span>
              <h3>Missão</h3>
              <p>
                Promover o bem-estar e a qualidade de vida dos funcionários do Banco do Brasil,
                seus familiares e da comunidade por meio de atividades sociais, culturais,
                esportivas e de lazer.
              </p>
            </article>
            <article className="principio-card">
              <span className="principio-num">II</span>
              <h3>Visão</h3>
              <p>
                Ser referência entre os clubes sociais e esportivos da região, com excelência
                em infraestrutura, atendimento e programação de eventos.
              </p>
            </article>
            <article className="principio-card">
              <span className="principio-num">III</span>
              <h3>Valores</h3>
              <ul className="principio-list">
                <li>Ética e transparência</li>
                <li>Respeito à diversidade</li>
                <li>Sustentabilidade</li>
                <li>Compromisso com os associados</li>
                <li>Espírito de comunidade</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* Diretoria */}
      <section className="sobre-diretoria">
        <div className="wrap">
          <div className="clube-eyebrow"><span className="clube-bn">03</span><span>Quem conduz o clube</span></div>
          <h2 className="clube-section-title">A <em>diretoria</em>.</h2>
          <p className="sobre-lede sobre-lede--center">
            Associados comprometidos com o desenvolvimento contínuo da AABB Jandaia do Sul.
            Gestão 2024–2027.
          </p>

          <div className="diretoria-grid">
            {diretoria.map((d) => (
              <article className="diretor-card" key={d.nome}>
                <div className="diretor-avatar">
                  <img
                    src="/images/default-avatar.png"
                    alt={d.cargo}
                    onError={(e) => { e.target.style.visibility = 'hidden'; }}
                  />
                  <span className="diretor-mono">{d.nome.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
                </div>
                <div className="diretor-cargo">{d.cargo}</div>
                <h3>{d.nome}</h3>
                <span className="diretor-gestao">Triênio 2024–2027</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="sobre-numeros">
        <div className="wrap">
          <div className="clube-eyebrow clube-eyebrow--gold"><span className="clube-bn">04</span><span>O clube em números</span></div>
          <div className="numeros-grid">
            {numeros.map((x) => (
              <div className="numero-card" key={x.l}>
                <div className="numero-n">{x.n}</div>
                <div className="numero-l">{x.l}</div>
              </div>
            ))}
          </div>
          <div className="sobre-cta">
            <Link to="/estrutura" className="btn-primary">
              <span>Conheça a estrutura</span><span className="btn-arrow">→</span>
            </Link>
            <Link to="/register" className="btn-ghost">Quero ser sócio →</Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Sobre;
