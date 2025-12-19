import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/auth';
import axios from '../api/axios';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Функция для получения пользователя из localStorage
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (userStr && token) {
        const userData = JSON.parse(userStr);
        
        // Устанавливаем заголовок Authorization для всех запросов
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return userData;
      }
    } catch (error) {
      console.error('Ошибка при чтении пользователя:', error);
    }
    return null;
  };

  // Функция для выхода
  const apiLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    const savedUser = getCurrentUser();
    
    if (savedUser) {
      setUser(savedUser);
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await apiLogin({ email, password });
      const { user, token } = data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Устанавливаем заголовок Authorization для всех запросов
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Ошибка входа' 
      };
    }
  };

  const register = async (email, password, name) => {
    try {
      const data = await apiRegister({ email, password, name });
      const { user, token } = data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Устанавливаем заголовок Authorization для всех запросов
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Ошибка регистрации' 
      };
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    window.location.href = '/';
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};