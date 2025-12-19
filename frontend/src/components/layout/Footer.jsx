import React from 'react';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">TravelPoint</h3>
            <p className="footer-description">
              Исследуйте мир вместе с нами. Лучшие статьи о путешествиях, советы и маршруты.
            </p>
          </div>
          
          
          <div className="footer-section">
            <h4>Контакты</h4>
            <p>Email: info@travelpoint.com</p>
            <p>Телефон: +7 (999) 123-45-67</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2025 TravelPoint. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;