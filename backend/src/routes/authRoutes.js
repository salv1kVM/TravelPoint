const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Регистрация
router.post('/register', register);

// Вход
router.post('/login', login);

// Получение текущего пользователя (требуется аутентификация)
router.get('/me', authMiddleware, getMe);

module.exports = router;