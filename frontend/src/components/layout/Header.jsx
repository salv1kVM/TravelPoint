import React from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.scss';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-primary">Travel</span>
            <span className="logo-secondary">Point</span>
          </Link>

          <nav className="nav">
            <NavLink to="/" className="nav-link">Главная</NavLink>
            <NavLink to="/articles" className="nav-link">Статьи</NavLink>

            {isAuthenticated ? (
              <>
                {/* Кнопка "Создать статью" для всех авторизованных */}
                <NavLink to="/create-article" className="nav-link create-article-btn">
                   Создать статью
                </NavLink>

                {/* Кнопка "Админ" только для админов */}
                {user?.role === 'ADMIN' && (
                  <NavLink to="/admin" className="nav-link admin-link">
                    <span className="admin-badge">👑 Админ</span>
                  </NavLink>
                )}
                
                <span className="user-info">
                  <span className="user-email">{user.email}</span>
                  {user.role === 'ADMIN' && (
                    <span className="user-badge">Админ</span>
                  )}
                </span>
                
                <button onClick={handleLogout} className="btn btn-outline logout-btn">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="nav-link">Войти</NavLink>
                <NavLink to="/register" className="btn btn-primary">Регистрация</NavLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;