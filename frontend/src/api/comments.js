import axios from './axios';

// Получить комментарии для статьи
export const getArticleComments = async (articleId) => {
  try {
    const response = await axios.get(`/comments/article/${articleId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении комментариев:', error);
    throw error;
  }
};

// Создать комментарий
export const createComment = async (articleId, content, parentId = null) => {
  try {
    console.log('Отправка комментария:', { articleId, content });
    const response = await axios.post(`/comments/${articleId}`, {
      content,
      parentId
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании комментария:', error);
    throw error;
  }
};

// Получить все комментарии (для админки)
export const getAllCommentsAdmin = async () => {
  try {
    const response = await axios.get('/comments/admin/all');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении комментариев для админки:', error);
    throw error;
  }
};

// Удалить комментарий
export const deleteComment = async (commentId) => {
  try {
    const response = await axios.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при удалении комментария:', error);
    throw error;
  }
};

// Обновить комментарий
export const updateComment = async (commentId, content) => {
  try {
    const response = await axios.put(`/comments/${commentId}`, { content });
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении комментария:', error);
    throw error;
  }
};