const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

// Регистрация пользователя
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Проверяем обязательные поля
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Пожалуйста, заполните все обязательные поля.' 
      });
    }
    
    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Пользователь с таким email уже существует.' 
      });
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Создаем пользователя
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'USER'
    });
    
    // Создаем JWT токен с ВСЕМИ данными
    const jwtSecret = process.env.JWT_SECRET || 'travelpoint_super_secret_key_2024';
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      jwtSecret,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    });
    
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера при регистрации.' });
  }
};

// Вход пользователя
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Пожалуйста, введите email и пароль.' 
      });
    }
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Неверный email или пароль.' 
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Неверный email или пароль.' 
      });
    }
    
    // Создаем JWT токен
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Вход выполнен успешно!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    });
    
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера при входе.' });
  }
};

// Получение текущего пользователя
const getMe = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера.' });
  }
};

module.exports = {
  register,
  login,
  getMe
};