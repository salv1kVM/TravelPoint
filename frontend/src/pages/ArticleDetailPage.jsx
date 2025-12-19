import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticleById } from '../api/articles';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/comments/CommentSection';
import './ArticleDetailPage.scss';
/**
 * Страница детального просмотра статьи
 * Получает реальные данные из бэкенда по ID
 */
const ArticleDetailPage = () => {
  const { id } = useParams(); // Получаем ID статьи из URL
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  
  // Загрузка статьи
  useEffect(() => {
    const loadArticle = async () => {
  try {
    setLoading(true);
    const response = await getArticleById(id);
    
    // Обработка разных форматов ответа
    if (response.article) {
      setArticle(response.article);
    } else if (response.id) {
      setArticle(response);
    } else {
      setError('Неверный формат ответа от сервера');
    }
  } catch (err) {
    console.error('Ошибка загрузки статьи:', err);
    setError('Не удалось загрузить статью');
  } finally {
    setLoading(false);
  }
  };

    if (id) {
      loadArticle();
    }
  }, [id]);

  // Обработчик лайка
  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Войдите, чтобы оценить статью');
      return;
    }

    try {
      // TODO: Реализовать запрос лайка на бэкенд
      setIsLiked(!isLiked);
      if (article) {
        setArticle({
          ...article,
          likes: isLiked ? article.likes - 1 : article.likes + 1
        });
      }
    } catch (error) {
      console.error('Ошибка при лайке:', error);
    }
  };

  // Обработчик шаринга
  const handleShare = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена!');
    }
  };

  // Если загрузка
  if (loading) {
    return (
      <div className="article-detail-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Загрузка статьи...</p>
          </div>
        </div>
      </div>
    );
  }

  // Если ошибка
  if (error || !article) {
    return (
      <div className="article-detail-page">
        <div className="container">
          <div className="article-not-found">
            <h1>Статья не найдена</h1>
            <p>Запрошенная статья не существует или была удалена.</p>
            <button 
              onClick={() => navigate('/articles')} 
              className="btn btn-primary"
            >
              Вернуться к статьям
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="article-detail-page">
      <div className="container">
        {/* Хлебные крошки */}
        <div className="breadcrumbs">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Главная
          </button> 
          <span className="breadcrumb-separator">/</span>
          <button onClick={() => navigate('/articles')} className="breadcrumb-link">
            Статьи
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{article.title}</span>
        </div>

        {/* Заголовок статьи */}
        <header className="article-header">
          <div className="article-category">
            <span className="category-badge">{article.category}</span>
          </div>
          
          <h1 className="article-title">{article.title}</h1>
          
          <div className="article-meta">
            <div className="author-info">
              {article.User?.avatar ? (
                <img 
                  src={article.User.avatar} 
                  alt={article.User.name}
                  className="author-avatar"
                />
              ) : (
                <div className="author-avatar-default">
                  {article.User?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <div className="author-name">
                  {article.User?.name || article.User?.username || 'Неизвестный автор'}
                </div>
                <div className="article-date-read">
                  <span className="article-date">{formatDate(article.createdAt)}</span>
                  <span className="article-read-time">• {article.readTime || 5} мин чтения</span>
                </div>
              </div>
            </div>
            
            <div className="article-stats">
              <div className="stat-item">
                <span className="stat-icon">👁️</span>
                <span className="stat-value">{article.views || 0}</span>
              </div>
              <button 
                className={`stat-item like-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
              >
                <span className="stat-icon">{isLiked ? '❤️' : '🤍'}</span>
                <span className="stat-value">{article.likes || 0}</span>
              </button>
              <div className="stat-item">
                <span className="stat-icon">💬</span>
                <span className="stat-value">0</span>
              </div>
            </div>
          </div>
        </header>

        {/* Изображение статьи */}
        <div className="article-hero">
          <img 
            src={article.imageUrl || '/images/default-article.jpg'} 
            alt={article.title}
            className="article-image"
            onError={(e) => {
              e.target.src = '/images/default-article.jpg';
            }}
          />
          {article.imageCredit && (
            <div className="image-credit">
              Фото: {article.imageCredit}
            </div>
          )}
        </div>

        {/* Краткое описание */}
        {article.excerpt && (
          <div className="article-excerpt">
            <p>{article.excerpt}</p>
          </div>
        )}

        {/* Содержимое статьи */}
        <div className="article-content">
          {article.content.split('\n').map((paragraph, index) => (
            paragraph.trim() && (
              <p key={index} className="article-paragraph">
                {paragraph}
              </p>
            )
          ))}
        </div>

        {/* Теги статьи */}
        {article.tags && (
          <div className="article-tags">
            {article.tags.split(',').map((tag, index) => (
              <span key={index} className="article-tag">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Действия с статьей */}
        <div className="article-actions">
          <button 
            className={`btn btn-like ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <span className="btn-icon">{isLiked ? '❤️' : '🤍'}</span>
            <span className="btn-text">Нравится ({article.likes || 0})</span>
          </button>
          
          <button className="btn btn-share" onClick={handleShare}>
            <span className="btn-icon">🔗</span>
            <span className="btn-text">Поделиться</span>
          </button>
          
          <button className="btn btn-save">
            <span className="btn-icon">📌</span>
            <span className="btn-text">Сохранить</span>
          </button>
        </div>

        {/* Раздел комментариев */}
        <div className="comments-container">
          <CommentSection articleId={id} />
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;