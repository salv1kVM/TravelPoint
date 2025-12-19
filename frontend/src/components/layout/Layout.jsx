import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './Layout.scss';
/**
 * Компонент Layout - обертка для всех страниц
 * Обеспечивает единую структуру: шапка → контент → подвал
 */
const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;