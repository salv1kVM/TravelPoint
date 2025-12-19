import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ArticleCard from '../components/common/ArticleCard';
import { getAllArticles } from '../api/articles'; // Используем правильный импорт
import './ArticlesPage.scss';

const ArticlesPage = () => {
  const location = useLocation();
  
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const categories = ['Все', 'Азия', 'Европа', 'Россия', 'Америка', 'Советы', 'Бюджет', 'Люкс'];

  // Чтение параметров из URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get('category');
    
    console.log('🔗 URL параметр категории:', categoryFromUrl);
    console.log('🔗 Полный URL:', window.location.href);
    
    if (categoryFromUrl) {
      console.log('🎯 Применяем категорию из URL:', categoryFromUrl);
      
      // Если категория есть в нашем списке
      const categoryInList = categories.find(cat => 
        cat.toLowerCase() === categoryFromUrl.toLowerCase()
      );
      
      if (categoryInList) {
        setSelectedCategory(categoryInList);
      } else {
        // Преобразуем русские названия
        const categoryMapping = {
          'япония': 'Азия',
          'таиланд': 'Азия',
          'вьетнам': 'Азия',
          'индонезия': 'Азия',
          'италия': 'Европа',
          'испания': 'Европа',
          'греция': 'Европа',
          'франция': 'Европа'
        };
        
        const mappedCategory = categoryMapping[categoryFromUrl.toLowerCase()];
        if (mappedCategory) {
          console.log('🔄 Маппинг категории:', categoryFromUrl, '→', mappedCategory);
          setSelectedCategory(mappedCategory);
        } else {
          console.log('⚠️ Категория не найдена, используем как есть:', categoryFromUrl);
          setSelectedCategory(categoryFromUrl);
        }
      }
      
      // Показываем уведомление пользователю
      setTimeout(() => {
        const banner = document.querySelector('.active-category-banner');
        if (banner) {
          banner.style.animation = 'pulse 1s';
          setTimeout(() => banner.style.animation = '', 1000);
        }
      }, 500);
    }
  }, [location.search]);

  // Загрузка статей
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        
        // Определяем категорию для API запроса
        let apiCategory = '';
        if (selectedCategory !== 'Все') {
          apiCategory = selectedCategory;
        }
        
        console.log('📡 Загрузка статей:', { 
          page: currentPage, 
          category: apiCategory || 'Все категории' 
        });
        
        // Запрос к API с правильным методом
        const data = await getAllArticles(currentPage, 6, apiCategory === '' ? 'all' : apiCategory);
        
        console.log('✅ Получены данные от API:', data);
        
        if (data && data.articles && Array.isArray(data.articles)) {
          setArticles(data.articles);
          setTotalPages(data.pagination?.totalPages || 1);
          setError(null);
        } else {
          console.warn('⚠️ API вернул неожиданный формат, используем статические статьи');
          setArticles(getStaticArticles(apiCategory));
          setTotalPages(1);
          setError('Сервер вернул неверный формат данных. Показываем демо-статьи.');
        }
        
      } catch (err) {
        console.error('❌ Ошибка загрузки статей:', err.message || err);
        setError(`Не удалось загрузить статьи: ${err.message || 'Неизвестная ошибка'}. Используем демо-данные.`);
        setArticles(getStaticArticles(selectedCategory));
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [currentPage, selectedCategory]);

  // Статические статьи для демо
  const getStaticArticles = (category) => {
    const allArticles = [
      {
        id: 1,
        title: 'Топ-10 мест в Японии весной',
        excerpt: 'От древних храмов Киото до современных небоскребов Токио...',
        imageUrl: '/images/article1.jpg',
        author: 'Мария Иванова',
        date: '15.12.2024',
        readTime: '5 мин',
        category: 'Азия',
        likes: 42
      },
      {
        id: 2,
        title: 'Бюджетные путешествия по Европе',
        excerpt: 'Секреты экономичных путешествий без ущерба для впечатлений...',
        imageUrl: '/images/article2.jpg',
        author: 'Алексей Петров',
        date: '10.12.2024',
        readTime: '7 мин',
        category: 'Европа',
        likes: 31
      },
      {
        id: 3,
        title: 'Скрытые пляжи Таиланда',
        excerpt: 'Малоизвестные места, где можно насладиться тишиной и природой...',
        imageUrl: '/images/article3.jpg',
        author: 'Екатерина Сидорова',
        date: '05.12.2024',
        readTime: '6 мин',
        category: 'Азия',
        likes: 28
      },
      {
        id: 4,
        title: 'Золотое кольцо России',
        excerpt: 'Путешествие по древним городам России...',
        imageUrl: '/images/article4.jpg',
        author: 'Иван Петров',
        date: '01.12.2024',
        readTime: '8 мин',
        category: 'Россия',
        likes: 19
      },
      {
        id: 5,
        title: 'Горные походы в Альпах',
        excerpt: 'Лучшие маршруты для начинающих и опытных туристов...',
        imageUrl: '/images/article5.jpg',
        author: 'Андрей Горный',
        date: '28.11.2024',
        readTime: '6 мин',
        category: 'Европа',
        likes: 37
      },
      {
        id: 6,
        title: 'Путешествие на авто по США',
        excerpt: 'Маршрут от Нью-Йорка до Сан-Франциско за 2 недели...',
        imageUrl: '/images/article6.jpg',
        author: 'Сергей Волков',
        date: '25.11.2024',
        readTime: '10 мин',
        category: 'Америка',
        likes: 24
      }
    ];
    
    if (category && category !== 'Все') {
      return allArticles.filter(article => 
        article.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    return allArticles;
  };

  const handleCategoryChange = (category) => {
    console.log('🔄 Смена категории:', category);
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Фильтрация статических статей (если API не работает)
  const filteredArticles = articles.filter(article => {
    if (selectedCategory === 'Все') return true;
    return article.category === selectedCategory;
  });

  if (loading) {
    return (
      <div className="articles-page loading">
        <div className="container">
          <div className="loader"></div>
          <p>Загрузка статей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="articles-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Все статьи о путешествиях</h1>
          <p className="page-subtitle">Исследуйте мир через наши статьи и советы</p>
        </div>

        {/* Баннер категории */}
        {selectedCategory !== 'Все' && (
          <div className="active-category-banner">
            <div className="category-info">
              <h2>
                <span className="category-label">Категория:</span>
                <span className="category-name"> {selectedCategory}</span>
              </h2>
              <p className="category-description">
                {selectedCategory === 'Азия' && 'Статьи о странах Азии: Япония, Таиланд, Вьетнам и другие'}
                {selectedCategory === 'Европа' && 'Статьи о европейских странах: Италия, Франция, Испания и другие'}
                {selectedCategory === 'Россия' && 'Статьи о путешествиях по России'}
                {selectedCategory === 'Америка' && 'Статьи о Северной и Южной Америке'}
                {selectedCategory === 'Советы' && 'Полезные советы для путешественников'}
                {selectedCategory === 'Бюджет' && 'Бюджетные путешествия и экономия'}
                {selectedCategory === 'Люкс' && 'Роскошные путешествия и премиум-отели'}
              </p>
            </div>
            <button 
              className="btn btn-outline-light"
              onClick={() => handleCategoryChange('Все')}
            >
              ✕ Показать все категории
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-warning">
            <strong>Внимание:</strong> {error}
          </div>
        )}

        <div className="articles-filters">
          <div className="filter-categories">
            {categories.map((category, index) => (
              <button 
                key={index} 
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
                title={`Показать статьи категории: ${category}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="articles-grid">
          {filteredArticles.length > 0 ? (
            filteredArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <div className="no-articles">
              <div className="no-articles-icon">📝</div>
              <h3>Статей в категории "{selectedCategory}" пока нет</h3>
              <p>Попробуйте выбрать другую категорию или создайте первую статью!</p>
              <button 
                className="btn btn-primary"
                onClick={() => handleCategoryChange('Все')}
              >
                Показать все статьи
              </button>
            </div>
          )}
        </div>

        {totalPages > 1 && filteredArticles.length > 0 && (
          <div className="pagination">
            <button 
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← 
            </button>
            
            <div className="pagination-info">
              Страница {currentPage} из {totalPages}
            </div>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(pageNumber => (
              <button 
                key={pageNumber}
                className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            
            {totalPages > 5 && (
              <span className="pagination-ellipsis">...</span>
            )}
            
            <button 
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
               →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesPage;