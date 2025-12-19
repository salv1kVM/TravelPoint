const { Comment, Article, User } = require('../models');

// Создать комментарий
exports.createComment = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id;

    console.log('Создание комментария:', { articleId, content, userId });

    // Проверяем существование статьи
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Статья не найдена' });
    }

    // Проверяем содержание комментария
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Комментарий не может быть пустым' });
    }

    const comment = await Comment.create({
      text: content.trim(),
      articleId: parseInt(articleId),
      userId
    });

    // Получаем комментарий с данными пользователя
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'name', 'email', 'role']
      }]
    });

    const response = commentWithUser.toJSON();
    response.content = response.text;
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Ошибка при создании комментария:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получить комментарии для статьи
exports.getArticleComments = async (req, res) => {
  try {
    const { articleId } = req.params;
    
    console.log('Получение комментариев для статьи:', articleId);
    
    const comments = await Comment.findAll({
      where: { 
        articleId: parseInt(articleId)
      },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedComments = comments.map(comment => {
      const commentJson = comment.toJSON();
      return {
        ...commentJson,
        content: commentJson.text
      };
    });

    console.log(' Найдено комментариев:', formattedComments.length);
    res.json(formattedComments);
    
  } catch (error) {
    console.error(' Ошибка при получении комментариев:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера',
      error: error.message
    });
  }
};

// Получить ВСЕ комментарии (для админки)
exports.getAllCommentsAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Доступ запрещен. Требуются права администратора.' 
      });
    }
    
    const comments = await Comment.findAll({
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Article,
          as: 'Article',
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Преобразуем text → content для фронтенда
    const formattedComments = comments.map(comment => {
      const commentJson = comment.toJSON();
      return {
        ...commentJson,
        content: commentJson.text
      };
    });
    
    res.json(formattedComments);
  } catch (error) {
    console.error('Ошибка получения комментариев для админки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удалить комментарий
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('Удаление комментария:', { id, userId, userRole });

    const comment = await Comment.findByPk(id, {
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'name']
      }]
    });

    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    // Проверяем права: автор или админ
    const isAuthor = comment.User.id === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Нет прав для удаления' });
    }

    await comment.destroy();
    res.json({ message: 'Комментарий удален' });
  } catch (error) {
    console.error('Ошибка при удалении комментария:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Обновить комментарий
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    console.log('Обновление комментария:', { id, content, userId });

    // Проверяем содержание
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Комментарий не может быть пустым' });
    }

    const comment = await Comment.findByPk(id, {
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'name']
      }]
    });

    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    // Только автор может редактировать
    if (comment.User.id !== userId) {
      return res.status(403).json({ message: 'Нет прав для редактирования' });
    }

    comment.text = content.trim();
    await comment.save();

    // Получаем обновленный комментарий
    const updatedComment = await Comment.findByPk(id, {
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'name', 'email', 'role']
      }]
    });

    // Добавляем поле content
    const response = updatedComment.toJSON();
    response.content = response.text;
    
    res.json(response);
  } catch (error) {
    console.error('Ошибка при обновлении комментария:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};