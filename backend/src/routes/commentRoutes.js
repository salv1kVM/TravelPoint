const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authMiddleware } = require('../middleware/authMiddleware');

console.log('=== commentRoutes.js loaded ===');

// Получить все комментарии статьи - публичный доступ (ВЫНЕСИ ПЕРЕД authMiddleware)
router.get('/article/:articleId', commentController.getArticleComments);

// Все остальные маршруты требуют аутентификации
router.use(authMiddleware);

// Создать комментарий для статьи
router.post('/:articleId', commentController.createComment);

// Получить все комментарии (для админки)
router.get('/admin/all', commentController.getAllCommentsAdmin);

// Удалить комментарий
router.delete('/:id', commentController.deleteComment);

// Обновить комментарий
router.put('/:id', commentController.updateComment);

module.exports = router;