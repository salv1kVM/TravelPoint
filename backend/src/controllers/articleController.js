const { Article, User, Comment } = require('../models/index');

// Получить все статьи (с пагинацией)
const getAllArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    
    let whereClause = {};
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    
    const { count, rows: articles } = await Article.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    res.json({
      articles,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    console.error('Ошибка получения статей:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении статей.' });
  }
};

// Получить все статьи для админки (без пагинации)
const getAllArticlesAdmin = async (req, res) => {
  try {
    console.log('=== getAllArticlesAdmin called ===');
    console.log('User from request:', req.user);
    console.log('User role:', req.user?.role);
    
    // Проверяем права - только для ADMIN
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Доступ запрещен. Требуются права администратора.' 
      });
    }
    
    const articles = await Article.findAll({
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Comment,
          as: 'Comments',
          attributes: ['id']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Добавляем количество комментариев к каждой статье
    const articlesWithStats = articles.map(article => {
      const articleJson = article.toJSON();
      return {
        ...articleJson,
        commentsCount: articleJson.Comments ? articleJson.Comments.length : 0
      };
    });
    
    console.log(`Found ${articlesWithStats.length} articles`);
    
    res.json(articlesWithStats);
    
  } catch (error) {
    console.error('Ошибка получения статей для админки:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении статей.' });
  }
};

// Получить статью по ID
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findByPk(id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Comment,
          as: 'Comments',
          include: [{
            model: User,
            as: 'User',
            attributes: ['id', 'name']
          }]
        }
      ]
    });
    
    if (!article) {
      return res.status(404).json({ error: 'Статья не найдена.' });
    }
    
    // Увеличиваем счетчик просмотров
    await article.increment('views');
    
    res.json({ article });
    
  } catch (error) {
    console.error('Ошибка получения статьи:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении статьи.' });
  }
};

// Создать статью (для всех авторизованных пользователей)
const createArticle = async (req, res) => {
  try {
    const { title, content, excerpt, imageUrl, category, readTime } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Заголовок обязателен.' });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Содержание обязательно.' });
    }
    
    if (title.length > 200) {
      return res.status(400).json({ error: 'Заголовок не должен превышать 200 символов.' });
    }
    
    // Создаем статью
    const article = await Article.create({
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt?.trim() || content.trim().substring(0, 200) + '...',
      imageUrl: imageUrl?.trim() || '/images/default-article.jpg',
      category: category || 'Путешествия',
      readTime: readTime || 5,
      views: 0,
      likes: 0,
      authorId: req.user.id
    });
    
    res.status(201).json({
      message: 'Статья успешно создана!',
      article
    });
    
  } catch (error) {
    console.error('Ошибка создания статьи:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ error: 'Ошибка сервера при создании статьи.' });
  }
};

// Обновить статью (только автор или ADMIN)
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, imageUrl, category, readTime } = req.body;
    
    const article = await Article.findByPk(id);
    
    if (!article) {
      return res.status(404).json({ error: 'Статья не найдена.' });
    }
    
    // Проверяем права (автор или ADMIN)
    if (article.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Недостаточно прав для редактирования.' });
    }
    
    // Обновляем статью
    await article.update({
      title: title ? title.trim() : article.title,
      content: content ? content.trim() : article.content,
      excerpt: excerpt ? excerpt.trim() : article.excerpt,
      imageUrl: imageUrl ? imageUrl.trim() : article.imageUrl,
      category: category || article.category,
      readTime: readTime || article.readTime
    });
    
    res.json({
      message: 'Статья успешно обновлена!',
      article
    });
    
  } catch (error) {
    console.error('Ошибка обновления статьи:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ error: 'Ошибка сервера при обновлении статьи.' });
  }
};

// Удалить статью (только автор или ADMIN)
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findByPk(id);
    
    if (!article) {
      return res.status(404).json({ error: 'Статья не найдена.' });
    }
    
    // Проверяем права (автор или ADMIN)
    if (article.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Недостаточно прав для удаления.' });
    }
    
    await article.destroy();
    
    res.json({
      message: 'Статья успешно удалена!'
    });
    
  } catch (error) {
    console.error('Ошибка удаления статьи:', error);
    res.status(500).json({ error: 'Ошибка сервера при удалении статьи.' });
  }
};

// Лайк статьи
const likeArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findByPk(id);
    
    if (!article) {
      return res.status(404).json({ error: 'Статья не найдена.' });
    }
    
    // Увеличиваем счетчик лайков
    await article.increment('likes');
    
    res.json({
      message: 'Лайк добавлен!',
      likes: article.likes + 1
    });
    
  } catch (error) {
    console.error('Ошибка добавления лайка:', error);
    res.status(500).json({ error: 'Ошибка сервера.' });
  }
};

module.exports = {
  getAllArticles,
  getAllArticlesAdmin,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  likeArticle
};