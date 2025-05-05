import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fechar o menu mobile quando a rota mudar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Adicionar classe quando o usuário rolar a página
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Fechar dropdowns quando o menu mobile é toggled
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Fechar o menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.main-nav') && !event.target.closest('.mobile-menu-toggle')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-content">
        <Link to="/" className="logo-link">
          <div className="logo-container">
            <div className="logo">
              <h1>AABB</h1>
            </div>
            <span className="logo-subtitle">Jandaia do Sul</span>
          </div>
        </Link>

        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className={`burger-icon ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link">Início</Link>
            </li>
            <li className="nav-item">
              <Link to="/sobre" className="nav-link">Sobre</Link>
            </li>
            <li className={`nav-item dropdown ${dropdownOpen ? 'open' : ''}`}>
              <button 
                className="dropdown-toggle nav-link" 
                onClick={toggleDropdown}
                aria-expanded={dropdownOpen}
              >
                O Clube <span className="dropdown-arrow"></span>
              </button>
              <ul className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                <li className="dropdown-item">
                  <Link to="/estrutura" className="dropdown-link">Estrutura</Link>
                </li>
                <li className="dropdown-item">
                  <Link to="/galeria" className="dropdown-link">Galeria</Link>
                </li>
                <li className="dropdown-item">
                  <Link to="/diretoria" className="dropdown-link">Diretoria</Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link to="/esportes" className="nav-link">Esportes</Link>
            </li>
            <li className="nav-item">
              <Link to="/eventos" className="nav-link">Eventos</Link>
            </li>
            {isAuthenticated() && (
              <li className="nav-item">
                <Link to="/reservas" className="nav-link">Minhas Reservas</Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="auth-buttons">
          {isAuthenticated() && user ? (
            <div className="user-info">
              <div className="user-avatar" title={user?.name || 'Usuário'}>
                <img
                  src={user?.avatar || '/images/default-avatar.png'}  
                  alt="Avatar"
                  className="avatar-img"
                  onError={(e) => {e.target.src = '/images/default-avatar.png'}}
                />
              </div>
              <span className="user-name">{user?.name || 'Usuário'}</span>
              <button 
                onClick={handleLogout} 
                className="logout-icon" 
                title="Sair"
                aria-label="Sair"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          ) : (
            <div className="auth-buttons-container">
              <Link to="/login" className="btn-login">Entrar</Link>
              <Link to="/register" className="btn-register">Registre-se</Link>
            </div>
          )}
        </div>
      </div>
      
      {mobileMenuOpen && <div className="backdrop" onClick={toggleMobileMenu}></div>}
    </header>
  );
}

export default Header;