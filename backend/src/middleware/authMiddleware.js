const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

const authMiddleware = async (req, res, next) => {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Доступ запрещен. Требуется аутентификация.' 
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ищем пользователя в базе данных
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден.' });
    }
    
    // Добавляем ВСЕ данные пользователя в запрос
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    req.token = token;
    
    console.log(' User authenticated:', { id: user.id, name: user.name, role: user.role });
    
    next();
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Недействительный токен.' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Токен истек.' });
    }
    
    res.status(401).json({ error: 'Ошибка аутентификации.' });
  }
};

const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Доступ запрещен.' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Доступ запрещен. Недостаточно прав.' 
      });
    }
    
    next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware
};