import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoUPSOS from '../assets/logoUPSOS.png';
import { useDarkMode } from '../DarkModeContext';
import './Banner.css';

const Banner = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const location = useLocation();

  React.useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  return (
    <div className={`banner${darkMode ? ' dark' : ''}`}>
      <div className="banner-content">
        <div className="banner-left">
          <Link to="/" className="logo-container">
            <img src={logoUPSOS} alt="UPSOS Logo" className="logo-img" />
            <span className="brand-name">UPSOS</span>
          </Link>
        </div>
        
        <div className="banner-right">
          <Link to="/faq" className={`nav-button ${location.pathname === '/faq' ? 'active' : ''}`}>
            FAQ
          </Link>
          <Link to="/map" className={`nav-button ${location.pathname === '/map' ? 'active' : ''}`}>
            Map
          </Link>
          <Link to="/login" className={`nav-button ${location.pathname === '/login' ? 'active' : ''}`}>
            Login
          </Link>
          <button 
            className="dark-mode-toggle"
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner; 