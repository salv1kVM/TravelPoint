import axios from './axios';

// Регистрация пользователя
export const register = async (userData) => {
  try {
    console.log('Отправка данных регистрации:', userData);
    const response = await axios.post('/auth/register', userData);
    console.log('Ответ от сервера:', response.data);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error(' Ошибка регистрации:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Ошибка регистрации' };
  }
};

// Вход пользователя
export const login = async (credentials) => {
  try {
    console.log('Отправка данных входа:', credentials);
    const response = await axios.post('/auth/login', credentials);
    console.log('Ответ от сервера:', response.data);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error(' Ошибка входа:', error.response?.data || error.message);
    throw error.response?.data || { error: 'Ошибка входа' };
  }
};

// Выход
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Получить текущего пользователя
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};