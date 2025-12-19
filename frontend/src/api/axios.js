import axios from 'axios';

// Создаем экземпляр axios с базовыми настройками
const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // Бэкенд на порту 5000
  timeout: 10000, // Таймаут 10 секунд
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена к каждому запросу
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ошибок
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Если токен недействителен, удаляем его
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;