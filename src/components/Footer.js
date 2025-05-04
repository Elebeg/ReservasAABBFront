import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>AABB</h3>
            <p>Associação Atlética Banco do Brasil</p>
            <p>Promovendo esporte, lazer e cultura para toda a família desde 1928.</p>
          </div>
          
          <div className="footer-section">
            <h3>Links Rápidos</h3>
            <ul>
              <li><Link to="/">Início</Link></li>
              <li><Link to="/sobre">Sobre</Link></li>
              <li><Link to="/eventos">Eventos</Link></li>
              <li><Link to="/esportes">Esportes</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Redes Sociais</h3>
            <div className="social-links">
              <a href="https://www.facebook.com/aabb.jandaiadosul.35/?locale=pt_BR" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="https://www.instagram.com/_aabbjandaia/" target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} AABB - Associação Atlética Banco do Brasil. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;