import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Импорт страниц
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import CreateArticlePage from './pages/CreateArticlePage'; // ДОБАВЛЕНО

import './styles/global.scss';

/**
 * Компонент для защищенных маршрутов
 * Заменяет временные переменные isAuthenticated и isAdmin
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Проверка авторизации...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

/**
 * Главный компонент приложения TravelPoint
 * Отвечает за маршрутизацию между страницами и общую структуру
 * 
 * Маршрутизация организована следующим образом:
 * - Публичные маршруты: доступны всем пользователей
 * - Защищенные маршруты: требуют аутентификации
 * - Админские маршруты: требуют роли ADMIN
 * 
 * Убраны временные переменные, теперь используется AuthContext
 */
const App = () => {
  return (
    // Оборачиваем всё приложение в провайдер аутентификации
    <AuthProvider>
      <Router>
        {/* Layout оборачивает все страницы, обеспечивая единый дизайн */}
        <Layout>
          <Routes>
            {/* ==================== ПУБЛИЧНЫЕ МАРШРУТЫ ==================== */}
            
            {/* Главная страница */}
            <Route path="/" element={<HomePage />} />
            
            {/* Страница со списком всех статей */}
            <Route path="/articles" element={<ArticlesPage />} />
            
            {/* Страница детального просмотра конкретной статьи */}
            <Route path="/articles/:id" element={<ArticleDetailPage />} />
            
            {/* Страница входа в аккаунт */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Страница регистрации нового пользователя */}
            <Route path="/register" element={<RegisterPage />} />

            {/* ==================== ЗАЩИЩЕННЫЕ МАРШРУТЫ ==================== */}
            
            {/* Создание статьи - доступ для всех авторизованных пользователей */}
            <Route 
              path="/create-article" 
              element={
                <ProtectedRoute>
                  <CreateArticlePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Административная панель - доступ только для пользователей с ролью ADMIN */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />

            {/* ==================== СЛУЖЕБНЫЕ МАРШРУТЫ ==================== */}
            
            {/* Резервный маршрут: перенаправляет на главную при неверном URL */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;