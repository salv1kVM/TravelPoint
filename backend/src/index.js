// Загружаем переменные окружения ПЕРВОЙ строкой
require('dotenv').config({ path: '.env' });

const express = require('express');
const cors = require('cors');
const { syncDatabase } = require('./models/index');

console.log('=== ЗАГРУЗКА СЕРВЕРА ===');
console.log(' Текущая директория:', process.cwd());

// ЯВНО устанавливаем переменные если они не загрузились
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'travelpoint_super_secret_key_2024';
  console.log(' JWT_SECRET установлен вручную');
}

if (!process.env.PORT) {
  process.env.PORT = '5000';
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'sqlite:./travelpoint.db';
}

// Импортируем маршруты
console.log('1. Загружаем маршруты...');

try {
  const authRoutes = require('./routes/authRoutes');
  console.log(' authRoutes загружен');
  
  const articleRoutes = require('./routes/articleRoutes');
  console.log(' articleRoutes загружен');
  
  const commentRoutes = require('./routes/commentRoutes');
  console.log(' commentRoutes загружен');
  
  const app = express();
  const PORT = process.env.PORT || 5000;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Тестовый маршрут
  app.get('/', (req, res) => {
    res.json({ 
      message: 'TravelPoint API is running!',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        articles: '/api/articles',
        comments: '/api/comments'
      }
    });
  });

  // Подключаем маршруты
  app.use('/api/auth', authRoutes);
  app.use('/api/articles', articleRoutes);
  app.use('/api/comments', commentRoutes);
  console.log(' Все маршруты подключены');

  // Обработка 404
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Запуск сервера
  const startServer = async () => {
    console.log('\n Запуск TravelPoint API...');
    
    // Синхронизируем базу данных
    const dbSynced = await syncDatabase();
    if (!dbSynced) {
      console.log('  Продолжаем без базы данных');
    } else {
      console.log(' База данных синхронизирована');
    }
    
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
      console.log(` Тест комментариев: http://localhost:${PORT}/api/comments/article/1`);
    });
  };

  startServer();
  
} catch (error) {
  console.error('ОШИБКА при загрузке маршрутов:');
  console.error('Сообщение:', error.message);
  console.error('Стек:', error.stack);
  process.exit(1);
}