const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { authMiddleware } = require('../middleware/authMiddleware');

console.log('=== articleRoutes.js loaded ===');

// Публичные маршруты (доступны всем)
router.get('/', articleController.getAllArticles);

// Маршрут /all должен быть ДО /:id
router.get('/all', authMiddleware, articleController.getAllArticlesAdmin);

// Маршрут для одной статьи
router.get('/:id', articleController.getArticleById);

// Защищенные маршруты (требуют аутентификации)
router.use(authMiddleware);

router.post('/', articleController.createArticle);
router.put('/:id', articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);
router.post('/:id/like', articleController.likeArticle);

module.exports = router;