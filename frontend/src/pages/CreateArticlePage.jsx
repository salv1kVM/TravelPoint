import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createArticle } from '../api/articles';
import './CreateArticlePage.scss';

const CreateArticlePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    category: 'Путешествия',
    readTime: 5
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Если пользователь не авторизован - редирект на логин
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Валидация на фронтенде
      if (!formData.title.trim()) {
        throw new Error('Введите заголовок статьи');
      }
      
      if (!formData.content.trim()) {
        throw new Error('Введите содержание статьи');
      }
      
      if (formData.title.length > 200) {
        throw new Error('Заголовок не должен превышать 200 символов');
      }
      
      // Создаем статью
      await createArticle(formData);
      
      // Успех!
      alert('✅ Статья создана успешно! Она появится после проверки модератором.');
      navigate('/articles');
      
    } catch (err) {
      console.error('Ошибка создания статьи:', err);
      setError(err.message || 'Ошибка при создании статьи');
    } finally {
      setLoading(false);
    }
  };

  // Категории статей
  const categories = [
    'Путешествия', 'Азия', 'Европа', 'Россия', 
    'Америка', 'Африка', 'Советы', 'Люкс', 'Бюджет'
  ];

  // Предустановленные картинки
  const presetImages = [
    { url: '/images/article1.jpg', label: 'Япония' },
    { url: '/images/article2.jpg', label: 'Европа' },
    { url: '/images/article3.jpg', label: 'Таиланд' },
    { url: '/images/article4.jpg', label: 'Россия' },
    { url: '/images/article5.jpg', label: 'Альпы' },
    { url: '/images/default-article.jpg', label: 'Дефолтная' }
  ];

  if (!isAuthenticated) {
    return null; // Пока идет редирект
  }

  return (
    <div className="create-article-page">
      <div className="container">
        <div className="page-header">
          <h1>📝 Создать новую статью</h1>
          <p className="page-subtitle">
            Поделитесь своим путешествием с сообществом TravelPoint
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="article-form">
          {/* Заголовок */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Заголовок статьи *
              <span className="char-count">
                {formData.title.length}/200 символов
              </span>
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Например: 'Мое путешествие в Японию весной'"
              className="form-input"
              maxLength="200"
              required
              disabled={loading}
            />
          </div>

          {/* Краткое описание */}
          <div className="form-group">
            <label htmlFor="excerpt" className="form-label">
              Краткое описание
              <span className="char-count">
                {formData.excerpt.length}/300 символов
              </span>
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Краткое описание, которое будет отображаться в списке статей"
              className="form-textarea"
              rows="3"
              maxLength="300"
              disabled={loading}
            />
          </div>

          {/* Содержание */}
          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Содержание статьи *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Расскажите о вашем путешествии подробно..."
              className="form-textarea content-textarea"
              rows="15"
              required
              disabled={loading}
            />
          </div>

          {/* Изображение */}
          <div className="form-section">
            <h3>Изображение для статьи</h3>
            
            <div className="form-group">
              <label htmlFor="imageUrl" className="form-label">
                URL изображения
              </label>
              <input
                id="imageUrl"
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="form-input"
                disabled={loading}
              />
              <p className="form-hint">
                Оставьте пустым, чтобы использовать изображение по умолчанию
              </p>
            </div>

            {/* Выбор из предустановленных */}
            <div className="preset-images">
              <p className="preset-label">Или выберите из готовых:</p>
              <div className="image-grid">
                {presetImages.map((img, index) => (
                  <div 
                    key={index}
                    className={`image-option ${formData.imageUrl === img.url ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, imageUrl: img.url})}
                  >
                    <img src={img.url} alt={img.label} />
                    <span className="image-label">{img.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Настройки */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Категория
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
                disabled={loading}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="readTime" className="form-label">
                Время чтения (минут)
              </label>
              <input
                id="readTime"
                type="number"
                name="readTime"
                value={formData.readTime}
                onChange={handleChange}
                min="1"
                max="60"
                className="form-input"
                disabled={loading}
              />
            </div>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* Кнопки */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/articles')}
              disabled={loading}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Создание...
                </>
              ) : 'Опубликовать статью'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateArticlePage;