import React, { useEffect } from 'react';
import { FaSignInAlt, FaUserPlus, FaBell, FaBook, FaCalendarAlt, FaGraduationCap, FaQuestionCircle, FaEnvelope, FaFileAlt, FaShieldAlt, FaSun, FaMoon } from 'react-icons/fa';
import logoUPSOS from '../assets/logoUPSOS.png';
import './UpsosHomepage.css';
import { useNavigate } from "react-router-dom";
import { useDarkMode } from '../DarkModeContext';

const UpsosHomepage = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('dark-mode');
    };
  }, [darkMode]);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleFAQClick = () => {
    navigate("/faq");
  };

  return (
    <div className={`upsos-app ${darkMode ? 'dark-mode' : ''}`}>
      <h1 style={{ padding: '20px', textAlign: 'center' }}>UPSOS Platform</h1>
      {/* Header */}
      <header className="futuristic-header">
        <div className="header-container">
          <div className="logo">
            <span>UPSOS</span>
          </div>
          <nav className="main-nav">
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Help</a></li>
              <li>
                <button className="dark-mode-toggle" onClick={toggleDarkMode}>
                  {darkMode ? <FaSun /> : <FaMoon />}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h2 className="hero-title">AGH Educational Platform</h2>
            <p className="hero-subtitle">Modern tool for managing your studies</p>
            <div className="hero-buttons">
              <button className="btn-login" onClick={handleLoginClick}>
                <FaSignInAlt className="btn-icon" /> Log In
               </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="logo-circle">
              <img src={logoUPSOS} alt="UPSOS Logo" className="logo-image" />
            </div>
            <div className="futuristic-circle"></div>
          </div>
        </div>
      </section>

      

      {/* Features Section */}
      <section id="about" className="features-section">
        <h2 className="section-title">About Upsos Platform</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaBook />
            </div>
            <h3>Integrated Platform</h3>
            <p>Combined USOS and UPEL together as one platform</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaCalendarAlt />
            </div>
            <h3>Real-time Communication</h3>
            <p>Instant messaging system for students and teachers with chat functionality.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaGraduationCap />
            </div>
            <h3>Academic Analytics</h3>
            <p>Track your grades, view course averages, and monitor your academic performance.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <h2 className="section-title">Help</h2>
        <div className="contact-cards">
          <div className="contact-card">
            <div className="contact-icon">
              <FaQuestionCircle />
            </div>
            <h3>Technical Support</h3>
            <p>Having issues with the platform?</p>
            <a href="mailto:upsos-support@agh.edu.pl" className="contact-link">
              <FaEnvelope /> upsos-support@gmail.com
            </a>
          </div>
          <div className="contact-card">
            <div className="contact-icon">
              <FaFileAlt />
            </div>
            <h3>FAQ</h3>
            <p>Find answers to frequently asked questions.</p>
            <a href="/FAQPage" className="contact-link" onClick={(e) => { e.preventDefault(); handleFAQClick(); }}>
              <FaFileAlt /> FAQ
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="futuristic-footer">
        <div className="footer-content">
          <div className="footer-left">
            <p>System version: 1.0.0</p>
          </div>
          <div className="footer-right">
            <a href="/privacy-policy"><FaShieldAlt /> Privacy Policy</a>
            <a href="/regulations"><FaFileAlt /> Regulations</a>
          </div>
        </div>
        <div className="footer-copyright">
          <p>© {new Date().getFullYear()} AGH UPSOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default UpsosHomepage;
