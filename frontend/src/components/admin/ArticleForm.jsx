import React, { useState } from 'react';
import './ArticleForm.scss';
/**
 * Компонент формы для создания и редактирования статей
 * Используется в админ-панели для управления контентом
 * 
 * @param {Object} props - Свойства компонента
 * @param {Object} props.article - Существующая статья для редактирования (опционально)
 * @param {Function} props.onSubmit - Функция обработки отправки формы
 * @param {Function} props.onCancel - Функция отмены редактирования/создания
 */
const ArticleForm = ({ article = null, onSubmit, onCancel }) => {
  // Начальное состояние формы
  const [formData, setFormData] = useState({
    title: article?.title || '',
    content: article?.content || '',
    category: article?.category || 'Европа',
    imageUrl: article?.imageUrl || '/images/article1.jpg',
    readTime: article?.readTime || '5 мин',
    excerpt: article?.excerpt || ''
  });

  // Список доступных категорий
  const categories = ['Европа', 'Азия', 'Америка', 'Советы', 'Бюджет', 'Люкс'];
  
  // Список доступных изображений
  const availableImages = [
    '/images/article1.jpg',
    '/images/article2.jpg', 
    '/images/article3.jpg',
    '/images/article4.jpg',
    '/images/article5.jpg',
    '/images/article6.jpg',
    '/images/article7.jpg',
    '/images/article8.jpg',
    '/images/article9.jpg',
    '/images/article10.jpg',
    '/images/article11.jpg',
    '/images/article12.jpg'
  ];

  /**
   * Обработчик изменения полей формы
   * @param {Event} e - Событие изменения input/textarea/select
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Обработчик выбора изображения
   * @param {string} imageUrl - URL выбранного изображения
   */
  const handleImageSelect = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      imageUrl
    }));
  };

  /**
   * Обработчик отправки формы
   * @param {Event} e - Событие отправки формы
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Валидация обязательных полей
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Заполните обязательные поля: заголовок и содержание');
      return;
    }
    
    // Если краткое описание не заполнено, создаем его из начала контента
    const finalFormData = {
      ...formData,
      excerpt: formData.excerpt || formData.content.substring(0, 150) + '...'
    };
    
    onSubmit(finalFormData);
  };

  /**
   * Обработчик отмены
   */
  const handleCancel = () => {
    if (window.confirm('Отменить изменения? Внесенные данные будут потеряны.')) {
      onCancel();
    }
  };

  return (
    <div className="article-form">
      <h2 className="form-title">
        {article ? '✏️ Редактировать статью' : '📝 Создать новую статью'}
      </h2>
      
      <form onSubmit={handleSubmit} className="admin-form">
        {/* Заголовок статьи */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Заголовок статьи *
            <span className="required-star">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-input"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Введите заголовок статьи (макс. 100 символов)"
            maxLength="100"
          />
          <div className="char-counter">
            {formData.title.length}/100 символов
          </div>
        </div>

        {/* Краткое описание */}
        <div className="form-group">
          <label htmlFor="excerpt" className="form-label">
            Краткое описание
            <span className="form-hint"> (отображается в карточке)</span>
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            className="form-textarea"
            value={formData.excerpt}
            onChange={handleChange}
            rows="3"
            placeholder="Краткое описание статьи (макс. 200 символов)..."
            maxLength="200"
          />
          <div className="char-counter">
            {formData.excerpt.length}/200 символов
          </div>
        </div>

        {/* Содержание статьи */}
        <div className="form-group">
          <label htmlFor="content" className="form-label">
            Содержание статьи *
            <span className="required-star">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            className="form-textarea"
            value={formData.content}
            onChange={handleChange}
            required
            rows="12"
            placeholder="Напишите полный текст статьи..."
          />
          <small className="form-hint">
            Используйте переводы строк для разделения абзацев. Можно использовать **жирный текст** (будет обработан на бэкенде).
          </small>
        </div>

        {/* Настройки статьи */}
        <div className="form-row">
          {/* Категория */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">Категория</label>
            <select
              id="category"
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Время чтения */}
          <div className="form-group">
            <label htmlFor="readTime" className="form-label">Время чтения</label>
            <select
              id="readTime"
              name="readTime"
              className="form-select"
              value={formData.readTime}
              onChange={handleChange}
            >
              <option value="3 мин">3 мин</option>
              <option value="5 мин">5 мин</option>
              <option value="7 мин">7 мин</option>
              <option value="10 мин">10 мин</option>
              <option value="15 мин">15 мин</option>
            </select>
          </div>
        </div>

        {/* Выбор изображения */}
        <div className="form-group">
          <label className="form-label">Изображение статьи</label>
          <div className="image-selection">
            <div className="current-image-preview">
              <div 
                className="preview-image"
                style={{ backgroundImage: `url(${formData.imageUrl})` }}
              ></div>
              <input
                type="text"
                className="form-input image-url-input"
                value={formData.imageUrl}
                onChange={handleChange}
                name="imageUrl"
                placeholder="/images/articleX.jpg"
              />
            </div>
            
            <div className="image-gallery">
              <p className="gallery-title">Выберите изображение из галереи:</p>
              <div className="gallery-grid">
                {availableImages.map((img, index) => (
                  <div 
                    key={index}
                    className={`gallery-item ${formData.imageUrl === img ? 'selected' : ''}`}
                    onClick={() => handleImageSelect(img)}
                  >
                    <div 
                      className="gallery-thumb"
                      style={{ backgroundImage: `url(${img})` }}
                    ></div>
                    <span className="image-name">article{index + 1}.jpg</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-outline"
            onClick={handleCancel}
          >
            Отмена
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
          >
            {article ? 'Сохранить изменения' : 'Опубликовать статью'}
          </button>
        </div>
      </form>

      {/* Предпросмотр */}
      <div className="form-preview">
        <h3 className="preview-title">📱 Предпросмотр карточки:</h3>
        <div className="preview-card">
          <div 
            className="preview-card-image"
            style={{ backgroundImage: `url(${formData.imageUrl})` }}
          >
            <div className="preview-badge">{formData.readTime}</div>
            <div className="preview-category">{formData.category}</div>
          </div>
          <div className="preview-card-content">
            <h4>{formData.title || 'Заголовок статьи'}</h4>
            <p>{formData.excerpt || (formData.content.substring(0, 150) + '...')}</p>
            <div className="preview-meta">
              <span className="preview-author">👤 Автор</span>
              <span className="preview-date">{new Date().toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleForm;