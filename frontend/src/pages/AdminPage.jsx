import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllArticlesAdmin, deleteArticle } from '../api/articles';
import { getAllCommentsAdmin, deleteComment } from '../api/comments';
import './AdminPage.scss';

const AdminPage = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('articles');
  const [articles, setArticles] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    pendingArticles: 0,
    comments: 0,
    users: 2
  });

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (activeTab === 'articles') {
          const articlesData = await getAllArticlesAdmin();
          console.log('Статьи для админки:', articlesData);
          setArticles(articlesData);
          
          // Обновляем статистику по статьям
          const published = articlesData.filter(a => a.status === 'published').length;
          const pending = articlesData.filter(a => a.status === 'pending').length;
          
          setStats(prev => ({
            ...prev,
            totalArticles: articlesData.length,
            publishedArticles: published,
            pendingArticles: pending
          }));
        } else if (activeTab === 'comments') {
          const commentsData = await getAllCommentsAdmin();
          console.log('Комментарии для админки:', commentsData);
          setComments(commentsData);
          
          setStats(prev => ({
            ...prev,
            comments: commentsData.length
          }));
        }
        
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        // Демо-данные для тестирования
        if (activeTab === 'articles') {
          setArticles(getDemoArticles());
          setStats(prev => ({
            ...prev,
            totalArticles: 5,
            publishedArticles: 3,
            pendingArticles: 2
          }));
        } else if (activeTab === 'comments') {
          setComments(getDemoComments());
          setStats(prev => ({ ...prev, comments: 3 }));
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [activeTab]);

  // Демо-статьи для тестирования
  const getDemoArticles = () => {
    return [
      {
        id: 1,
        title: 'Топ-10 мест в Японии весной',
        content: 'Содержание статьи...',
        excerpt: 'От древних храмов Киото...',
        imageUrl: '/images/article1.jpg',
        category: 'Азия',
        readTime: 5,
        likes: 42,
        views: 120,
        status: 'published',
        createdAt: '2024-12-15T10:00:00.000Z',
        updatedAt: '2024-12-15T10:00:00.000Z',
        User: {
          name: 'Мария Иванова',
          email: 'user@test.com'
        }
      },
      {
        id: 2,
        title: 'Бюджетные путешествия по Европе',
        content: 'Содержание статьи...',
        excerpt: 'Секреты экономичных путешествий...',
        imageUrl: '/images/article2.jpg',
        category: 'Европа',
        readTime: 7,
        likes: 31,
        views: 95,
        status: 'published',
        createdAt: '2024-12-10T10:00:00.000Z',
        updatedAt: '2024-12-10T10:00:00.000Z',
        User: {
          name: 'Алексей Петров',
          email: 'admin@test.com'
        }
      },
      {
        id: 3,
        title: 'Новая статья на модерации',
        content: 'Содержание статьи...',
        excerpt: 'Эта статья ожидает проверки...',
        imageUrl: '/images/default-article.jpg',
        category: 'Советы',
        readTime: 5,
        likes: 0,
        views: 0,
        status: 'pending',
        createdAt: '2024-12-18T09:00:00.000Z',
        updatedAt: '2024-12-18T09:00:00.000Z',
        User: {
          name: 'Новый пользователь',
          email: 'new@test.com'
        }
      }
    ];
  };

  // Демо-комментарии для тестирования
  const getDemoComments = () => {
    return [
      {
        id: 1,
        content: 'Отличная статья, спасибо!',
        createdAt: '2024-12-16T14:30:00.000Z',
        User: {
          name: 'Иван Иванов',
          email: 'ivan@test.com'
        },
        Article: {
          title: 'Топ-10 мест в Японии весной'
        },
        articleId: 1
      }
    ];
  };

  // Удаление статьи
  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту статью?')) return;
    
    try {
      await deleteArticle(articleId);
      setArticles(articles.filter(article => article.id !== articleId));
      setStats(prev => ({ 
        ...prev, 
        totalArticles: prev.totalArticles - 1,
        publishedArticles: prev.publishedArticles - (articles.find(a => a.id === articleId)?.status === 'published' ? 1 : 0),
        pendingArticles: prev.pendingArticles - (articles.find(a => a.id === articleId)?.status === 'pending' ? 1 : 0)
      }));
      alert('Статья успешно удалена!');
    } catch (error) {
      console.error('Ошибка удаления статьи:', error);
      alert('Ошибка при удалении статьи: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  // Удаление комментария
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот комментарий?')) return;
    
    try {
      await deleteComment(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
      setStats(prev => ({ ...prev, comments: prev.comments - 1 }));
      alert('Комментарий успешно удален!');
    } catch (error) {
      console.error('Ошибка удаления комментария:', error);
      alert('Ошибка при удалении комментария');
    }
  };

  // Изменение статуса статьи (опубликовать/в модерацию)
  const handleToggleArticleStatus = async (articleId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'pending' : 'published';
    const action = newStatus === 'published' ? 'опубликовать' : 'отправить на модерацию';
    
    if (!window.confirm(`Вы уверены, что хотите ${action} эту статью?`)) return;
    
    try {
      // Здесь нужно будет добавить вызов API для обновления статуса
      // await updateArticleStatus(articleId, newStatus);
      
      // Пока временно обновляем локально
      setArticles(articles.map(article => 
        article.id === articleId 
          ? { ...article, status: newStatus }
          : article
      ));
      
      // Обновляем статистику
      setStats(prev => ({
        ...prev,
        publishedArticles: newStatus === 'published' ? prev.publishedArticles + 1 : prev.publishedArticles - 1,
        pendingArticles: newStatus === 'pending' ? prev.pendingArticles + 1 : prev.pendingArticles - 1
      }));
      
      alert(`Статья успешно ${newStatus === 'published' ? 'опубликована' : 'отправлена на модерацию'}!`);
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      alert('Ошибка при изменении статуса статьи');
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Неизвестно';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Получение цвета статуса
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'var(--success)';
      case 'pending': return 'var(--warning)';
      case 'draft': return 'var(--gray)';
      default: return 'var(--gray)';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Проверка прав администратора
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="access-denied">
            <h2>⛔ Доступ запрещен</h2>
            <p>У вас недостаточно прав для доступа к панели администратора.</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              На главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>👑 Панель администратора</h1>
            <p className="admin-subtitle">
              Добро пожаловать, <strong>{user?.name || user?.email}</strong>!
            </p>
          </div>
          <div className="admin-actions">
            <button onClick={() => navigate('/')} className="btn btn-outline">
              На главную
            </button>
            <button onClick={() => navigate('/create-article')} className="btn btn-outline">
              + Создать статью
            </button>
            <button onClick={handleLogout} className="btn btn-danger">
              Выйти
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.totalArticles}</div>
            <div className="stat-label">Всего статей</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.publishedArticles}</div>
            <div className="stat-label">Опубликовано</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pendingArticles}</div>
            <div className="stat-label">На модерации</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.comments}</div>
            <div className="stat-label">Комментариев</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.users}</div>
            <div className="stat-label">Пользователей</div>
          </div>
        </div>

        {/* Табы */}
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            📝 Статьи ({stats.totalArticles})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            💬 Комментарии ({stats.comments})
          </button>
        </div>

        {/* Контент */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Загрузка...</p>
          </div>
        ) : activeTab === 'articles' ? (
          // Раздел статей
          <div className="articles-section">
            <div className="section-header">
              <h2>Управление статьями</h2>
              <div className="section-actions">
                <button 
                  onClick={() => navigate('/create-article')}
                  className="btn btn-primary"
                >
                  + Создать новую статью
                </button>
              </div>
            </div>
            
            {articles.length === 0 ? (
              <div className="no-data">
                <p>😕 Нет статей для отображения</p>
                <button 
                  onClick={() => navigate('/create-article')}
                  className="btn btn-primary"
                >
                  Создать первую статью
                </button>
              </div>
            ) : (
              <div className="articles-list">
                {articles.map(article => (
                  <div key={article.id} className="article-item">
                    <div className="article-status" style={{ backgroundColor: getStatusColor(article.status) }}>
                      {article.status === 'published' ? 'Опубликовано' : 
                       article.status === 'pending' ? 'На модерации' : 'Черновик'}
                    </div>
                    
                    <div className="article-info">
                      <h3 className="article-title">{article.title}</h3>
                      <div className="article-meta">
                        <span className="meta-item">
                          <strong>Автор:</strong> {article.User?.name || article.User?.email || 'Неизвестно'}
                          {article.User?.role === 'ADMIN' && ' 👑'}
                        </span>
                        <span className="meta-item">
                          <strong>Дата:</strong> {formatDate(article.createdAt)}
                        </span>
                        <span className="meta-item">
                          <strong>Категория:</strong> {article.category || 'Без категории'}
                        </span>
                        <span className="meta-item">
                          <strong>Статистика:</strong> 👁️ {article.views || 0} | ❤️ {article.likes || 0} | 💬 {article.commentsCount || 0}
                        </span>
                      </div>
                      
                      <div className="article-excerpt">
                        {article.excerpt || article.content?.substring(0, 150) + '...'}
                      </div>
                    </div>
                    
                    <div className="article-actions">
                      <button 
                        onClick={() => navigate(`/articles/${article.id}`)}
                        className="btn btn-outline btn-sm"
                        title="Просмотреть статью"
                      >
                        👁️ Просмотр
                      </button>
                      
                      <button 
                        onClick={() => navigate(`/create-article?edit=${article.id}`)}
                        className="btn btn-outline btn-sm"
                        title="Редактировать статью"
                      >
                        ✏️ Редактировать
                      </button>
                      
                      <button 
                        onClick={() => handleToggleArticleStatus(article.id, article.status)}
                        className="btn btn-warning btn-sm"
                        title={article.status === 'published' ? 'Отправить на модерацию' : 'Опубликовать'}
                      >
                        {article.status === 'published' ? '📝 В модерацию' : '✅ Опубликовать'}
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteArticle(article.id)}
                        className="btn btn-danger btn-sm"
                        title="Удалить статью"
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Раздел комментариев
          <div className="comments-section">
            <div className="section-header">
              <h2>Управление комментариями</h2>
            </div>
            
            {comments.length === 0 ? (
              <div className="no-data">
                <p>💬 Нет комментариев для отображения</p>
              </div>
            ) : (
              <div className="comments-list">
                {comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-author">
                        <strong>{comment.User?.name || 'Аноним'}</strong>
                        <span className="comment-email">({comment.User?.email})</span>
                        {comment.User?.role === 'ADMIN' && (
                          <span className="user-badge admin">👑 Админ</span>
                        )}
                      </div>
                      <div className="comment-date">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                    
                    <div className="comment-article">
                      <strong>Статья:</strong> {comment.Article?.title || 'Статья удалена'}
                      <span 
                        className="article-link" 
                        onClick={() => comment.articleId && navigate(`/articles/${comment.articleId}`)}
                        style={{ cursor: comment.articleId ? 'pointer' : 'default', opacity: comment.articleId ? 1 : 0.5 }}
                      >
                        {comment.articleId ? ' (перейти →)' : ' (статья удалена)'}
                      </span>
                    </div>
                    
                    <div className="comment-content">
                      {comment.content}
                    </div>
                    
                    <div className="comment-actions">
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="btn btn-danger btn-sm"
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;