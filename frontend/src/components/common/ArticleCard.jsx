import React from 'react';
import { useNavigate } from 'react-router-dom'; // Добавляем импорт
import './ArticleCard.scss';
/**
 * Компонент карточки статьи
 * Отображает изображение, заголовок, краткое описание и мета-информацию
 */
const ArticleCard = ({ article }) => {
  const navigate = useNavigate(); // Добавляем хук для навигации

  const handleReadMore = () => {
    // Переходим на страницу детального просмотра статьи
    navigate(`/articles/${article.id}`);
  };

  return (
    <div className="article-card hover-lift">
      <div 
        className="article-image"
        style={{ 
          backgroundImage: `url(${article.imageUrl})`,
          cursor: 'pointer' // Объединяем стили
        }}
        onClick={handleReadMore} // Добавляем клик на изображение
      >
        <div className="article-overlay"></div>
        <div className="article-badge">{article.readTime}</div>
        {/* Добавляем бейдж категории */}
        {article.category && (
          <div className="article-category-badge">{article.category}</div>
        )}
      </div>
      
      <div className="article-content">
        <h3 
          className="article-title"
          onClick={handleReadMore}
          style={{ cursor: 'pointer' }}
        >
          {article.title}
        </h3>
        <p className="article-excerpt">{article.excerpt}</p>
        
        <div className="article-meta">
          <div className="article-author">
            <div className="author-avatar"></div>
            <span>{article.author}</span>
          </div>
          <span className="article-date">{article.date}</span>
        </div>
        
        <button 
          className="btn btn-outline btn-sm"
          onClick={handleReadMore}
        >
          Читать далее
        </button>
      </div>
    </div>
  );
};

export default ArticleCard;