import axios from './axios';

// Получить все статьи (с пагинацией и фильтрацией)
export const getAllArticles = async (page = 1, limit = 10, category = 'all') => {
  try {
    const response = await axios.get('/articles', {
      params: { 
        page: Math.max(1, parseInt(page) || 1),
        limit: Math.max(1, Math.min(parseInt(limit) || 10, 100)), // Макс 100 статей
        category: category === 'all' ? undefined : category
      }
    });
    
    if (response.data && response.data.articles) {
      return {
        articles: response.data.articles,
        pagination: response.data.pagination || {
          page: parseInt(page),
          limit: parseInt(limit),
          total: response.data.articles.length,
          totalPages: 1
        }
      };
    }
    
    throw new Error('Неверный формат ответа от сервера');
    
  } catch (error) {
    console.error(' Ошибка при получении статей:', error.response?.data || error.message);
    
    // Возвращаем пустой результат для удобства UI
    return {
      articles: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        totalPages: 0
      },
      error: error.response?.data?.error || 'Не удалось загрузить статьи'
    };
  }
};

// Получить статью по ID
export const getArticleById = async (id) => {
  if (!id || isNaN(parseInt(id))) {
    throw new Error('Неверный ID статьи');
  }
  
  try {
    const response = await axios.get(`/articles/${id}`);
    
    if (!response.data || (!response.data.article && !response.data.id)) {
      throw new Error('Статья не найдена');
    }
    
    // Обрабатываем оба варианта ответа: {article: {...}} или {...}
    const articleData = response.data.article || response.data;
    
    // Добавляем дефолтные значения если их нет
    return {
      ...articleData,
      imageUrl: articleData.imageUrl || '/images/default-article.jpg',
      likes: articleData.likes || 0,
      views: articleData.views || 0,
      readTime: articleData.readTime || 5,
      category: articleData.category || 'Путешествия'
    };
    
  } catch (error) {
    console.error(` Ошибка при получении статьи ${id}:`, error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      throw new Error('Статья не найдена');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Требуется авторизация');
    }
    
    throw new Error(error.response?.data?.error || 'Не удалось загрузить статью');
  }
};

// Создать статью (только для авторизованных)
export const createArticle = async (articleData) => {
  // Валидация на фронтенде
  if (!articleData.title || !articleData.title.trim()) {
    throw new Error('Заголовок обязателен');
  }
  
  if (!articleData.content || !articleData.content.trim()) {
    throw new Error('Содержание обязательно');
  }
  
  if (articleData.title.length > 200) {
    throw new Error('Заголовок не должен превышать 200 символов');
  }
  
  try {
    const dataToSend = {
      title: articleData.title.trim(),
      content: articleData.content.trim(),
      excerpt: articleData.excerpt?.trim() || articleData.content.trim().substring(0, 200) + '...',
      imageUrl: articleData.imageUrl?.trim() || '',
      category: articleData.category || 'Путешествия',
      readTime: Math.min(Math.max(parseInt(articleData.readTime) || 5, 1), 60) // 1-60 минут
    };
    
    console.log(' Отправка статьи:', dataToSend);
    const response = await axios.post('/articles', dataToSend);
    
    if (!response.data) {
      throw new Error('Пустой ответ от сервера');
    }
    
    console.log(' Статья создана:', response.data);
    return response.data;
    
  } catch (error) {
    console.error(' Ошибка при создании статьи:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        'Ошибка при создании статьи';
    
    throw new Error(errorMessage);
  }
};

// Обновить статью
export const updateArticle = async (id, articleData) => {
  if (!id || isNaN(parseInt(id))) {
    throw new Error('Неверный ID статьи');
  }
  
  try {
    const response = await axios.put(`/articles/${id}`, {
      title: articleData.title?.trim(),
      content: articleData.content?.trim(),
      excerpt: articleData.excerpt?.trim(),
      imageUrl: articleData.imageUrl?.trim(),
      category: articleData.category,
      readTime: articleData.readTime
    });
    
    return response.data;
    
  } catch (error) {
    console.error(` Ошибка при обновлении статьи ${id}:`, error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      throw new Error('Недостаточно прав для редактирования');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Статья не найдена');
    }
    
    throw new Error(error.response?.data?.error || 'Ошибка при обновлении статьи');
  }
};

// Удалить статью
export const deleteArticle = async (id) => {
  if (!id || isNaN(parseInt(id))) {
    throw new Error('Неверный ID статьи');
  }
  
  try {
    const response = await axios.delete(`/articles/${id}`);
    return response.data;
    
  } catch (error) {
    console.error(` Ошибка при удалении статьи ${id}:`, error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      throw new Error('Недостаточно прав для удаления');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Статья не найдена');
    }
    
    throw new Error(error.response?.data?.error || 'Ошибка при удалении статьи');
  }
};

// Лайкнуть статью
export const likeArticle = async (id) => {
  if (!id || isNaN(parseInt(id))) {
    throw new Error('Неверный ID статьи');
  }
  
  try {
    const response = await axios.post(`/articles/${id}/like`);
    return response.data;
    
  } catch (error) {
    console.error(` Ошибка при лайке статьи ${id}:`, error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Войдите, чтобы оценить статью');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Статья не найдена');
    }
    
    throw new Error(error.response?.data?.error || 'Ошибка при оценке статьи');
  }
};

// Получить все статьи для админки (без пагинации) - ИСПРАВЛЕННАЯ ФУНКЦИЯ
export const getAllArticlesAdmin = async () => {
  try {
    console.log('📡 Запрос статей для админки...');
    
    const response = await axios.get('/articles/all');
    console.log(' Ответ от /articles/all:', response.data);
    
    // Проверяем ответ
    if (!response.data) {
      throw new Error('Пустой ответ от сервера');
    }
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    // Возвращаем данные
    return Array.isArray(response.data) ? response.data : [];
    
  } catch (error) {
    console.error(' Ошибка при получении статей для админки:', error);
    
    // Детализация ошибки
    if (error.response) {
      console.error('Статус:', error.response.status);
      console.error('Данные:', error.response.data);
      
      if (error.response.status === 401) {
        throw new Error('Требуется авторизация. Войдите в систему.');
      } else if (error.response.status === 403) {
        throw new Error('Требуются права администратора.');
      } else if (error.response.status === 404) {
        throw new Error('Маршрут не найден. Проверьте настройки сервера.');
      }
    }
    
    throw new Error(error.response?.data?.error || error.message || 'Ошибка при загрузке статей');
  }
};

// Получить статьи пользователя
export const getUserArticles = async (userId) => {
  try {
    const response = await axios.get(`/articles/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(' Ошибка при получении статей пользователя:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Ошибка при загрузке статей');
  }
};

// Экспортируем все функции
export default {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  getAllArticlesAdmin,
  getUserArticles
};