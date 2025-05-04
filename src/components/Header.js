import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // Redirecionamento para a página inicial após logout
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo">
          <Link to="/">
            <div className="logo-container">
              <h1>AABB</h1>
              <span className="logo-subtitle">Jandaia do Sul</span>
            </div>
          </Link>
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <span className={`burger-icon ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul>
            <li><Link to="/" onClick={() => setMobileMenuOpen(false)}>Início</Link></li>
            <li><Link to="/sobre" onClick={() => setMobileMenuOpen(false)}>Sobre</Link></li>
            <li className="dropdown">
              <span className="dropdown-toggle">O Clube</span>
              <ul className="dropdown-menu">
                <li><Link to="/estrutura" onClick={() => setMobileMenuOpen(false)}>Estrutura</Link></li>
                <li><Link to="/galeria" onClick={() => setMobileMenuOpen(false)}>Galeria</Link></li>
                <li><Link to="/diretoria" onClick={() => setMobileMenuOpen(false)}>Diretoria</Link></li>
              </ul>
            </li>
            <li><Link to="/esportes" onClick={() => setMobileMenuOpen(false)}>Esportes</Link></li>
            <li><Link to="/eventos" onClick={() => setMobileMenuOpen(false)}>Eventos</Link></li>
            {isAuthenticated() && (
              <li><Link to="/reservas" onClick={() => setMobileMenuOpen(false)}>Minhas Reservas</Link></li>
            )}
          </ul>
        </nav>

        <div className="auth-buttons">
          {isAuthenticated() && user ? (
            <div className="user-info">
              <div className="user-avatar">
                <img
                  src={'/images/default-avatar.png'}  
                  alt="Avatar"
                  className="avatar-img"
                />
              </div>
              <span className="user-name">{user?.name || 'Usuário'}</span>
              <button onClick={handleLogout} className="logout-icon" title="Sair">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Registre-se</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;