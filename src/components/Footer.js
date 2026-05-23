import React from 'react';
import { Link } from 'react-router-dom';
import { FootCrest } from './Crest';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="foot">
      <div className="wrap">

        <div className="foot-top">
          <FootCrest />

          <div className="foot-motto">
            <div className="fm-eye">Lema do clube</div>
            <p className="fm-text">
              <em>«</em> Esporte, família, <br />tradição e fim de semana. <em>»</em>
            </p>
          </div>
        </div>

        <div className="foot-divider" aria-hidden="true" />

        <div className="foot-grid">
          <div>
            <div className="fg-eye">O clube</div>
            <p>
              <Link to="/sobre">Sobre a AABB</Link><br />
              <Link to="/estrutura">Estrutura</Link><br />
              <Link to="/esportes">Esportes</Link><br />
              <Link to="/eventos">Eventos</Link>
            </p>
          </div>
          <div>
            <div className="fg-eye">Sócio</div>
            <p>
              <Link to="/register">Tornar-se sócio</Link><br />
              <Link to="/login">Entrar na conta</Link><br />
              <Link to="/reservas">Reservar quadra</Link><br />
              <Link to="/campeonato">Campeonato interno</Link>
            </p>
          </div>
          <div>
            <div className="fg-eye">Encontre o clube</div>
            <p>
              <a href="https://www.instagram.com/_aabbjandaia/" target="_blank" rel="noopener noreferrer">
                Instagram · @_aabbjandaia
              </a><br />
              <a href="https://www.facebook.com/aabb.jandaiadosul.35/?locale=pt_BR" target="_blank" rel="noopener noreferrer">
                Facebook · aabb.jandaiadosul
              </a>
            </p>
          </div>
          <div>
            <div className="fg-eye">Casa do clube</div>
            <p>Jandaia do Sul · Paraná<br />Esporte, lazer e cultura<br />para toda a família, desde 1978.</p>
          </div>
        </div>

        <div className="foot-bottom">
          <span>© 1978 – {currentYear} · Associação Atlética Banco do Brasil — Jandaia do Sul / PR</span>
          <span>Entidade recreativa · Todos os direitos reservados</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
