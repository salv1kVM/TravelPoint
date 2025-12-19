import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArticleCard from '../components/common/ArticleCard';
import { getAllArticles } from '../api/articles'; // Импорт API
import './HomePage.scss';

const TypingEffect = ({ text, speed = 100 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return <span>{displayedText}</span>;
};

const HomePage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка популярных статей
  useEffect(() => {
    const loadFeaturedArticles = async () => {
      try {
        setLoading(true);
        // Получаем 3 самые просматриваемые или новые статьи
        const data = await getAllArticles(1, 3, 'all');
        
        if (data.articles && data.articles.length > 0) {
          // Берем первые 3 статьи
          setFeaturedArticles(data.articles.slice(0, 3));
        } else {
          // Если нет статей в базе, используем демо
          setFeaturedArticles(getDemoArticles());
        }
      } catch (error) {
        console.error('Ошибка загрузки популярных статей:', error);
        setFeaturedArticles(getDemoArticles());
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedArticles();
  }, []);

  // Отслеживание скролла для параллакса
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Демо-статьи если база пуста
  const getDemoArticles = () => {
    return [
      {
        id: 4, // Используем реальный ID из базы
        title: 'Топ-10 мест в Японии весной',
        excerpt: 'От древних храмов Киото до современных небоскребов Токио...',
        imageUrl: '/images/article1-5.jpg',
        author: 'Мария Иванова',
        date: '15.12.2024',
        readTime: '5 мин',
        category: 'Азия',
        views: 120,
        likes: 42
      },
      {
        id: 5, // Используем реальный ID из базы
        title: 'Бюджетные путешествия по Европе',
        excerpt: 'Секреты экономичных путешествий без ущерба для впечатлений...',
        imageUrl: '/images/article1-5.jpg',
        author: 'Алексей Петров',
        date: '10.12.2024',
        readTime: '7 мин',
        category: 'Европа',
        views: 95,
        likes: 31
      },
      {
        id: 6, // Используем реальный ID из базы
        title: 'Скрытые пляжи Таиланда',
        excerpt: 'Малоизвестные места, где можно насладиться тишиной и природой...',
        imageUrl: '/images/article1-5.jpg',
        author: 'Екатерина Сидорова',
        date: '05.12.2024',
        readTime: '6 мин',
        category: 'Азия',
        views: 110,
        likes: 28
      }
    ];
  };

  const popularDestinations = [
    { name: 'Япония', image: '/images/japan.jpg' },
    { name: 'Италия', image: '/images/italy.jpg' },
    { name: 'Таиланд', image: '/images/thailand.jpg' },
    { name: 'Испания', image: '/images/spain.jpg' },
    { name: 'Греция', image: '/images/greciy.jpg' },
    { name: 'Вьетнам', image: '/images/vetnam.jpg' },
    { name: 'Франция', image: '/images/france.jpg' },
    { name: 'Индонезия', image: '/images/indonesia.jpg' }
  ];

  // Функция для обработки клика по направлению
  const handleDestinationClick = (destinationName) => {
    const categoryMap = {
      'Япония': 'Азия',
      'Италия': 'Европа',
      'Таиланд': 'Азия',
      'Испания': 'Европа',
      'Греция': 'Европа',
      'Вьетнам': 'Азия',
      'Франция': 'Европа',
      'Индонезия': 'Азия'
    };
    
    const category = categoryMap[destinationName] || destinationName;
    navigate(`/articles?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="home-page">
      {/* Герой секция */}
      <section 
        className="hero"
        style={{ 
          backgroundPosition: `center ${scrollY * 0.5}px`
        }}
      >
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <TypingEffect text="Откройте мир с " speed={50} />
              <span className="highlight">TravelPoint</span>
            </h1>
            <p className="hero-subtitle">
              Лучшие статьи о путешествиях, советы опытных туристов и вдохновляющие маршруты
            </p>
            <button 
              className="btn btn-primary btn-lg pulse"
              onClick={() => navigate('/articles')}
            >
              Начать исследовать
            </button>
          </div>
        </div>
      </section>

      {/* Популярные статьи */}
      <section className="featured-articles">
        <div className="container">
          <h2 className="section-title">Популярные статьи</h2>
          
          {loading ? (
            <div className="loading-articles">
              <div className="loader"></div>
              <p>Загрузка статей...</p>
            </div>
          ) : (
            <>
              <div className="articles-grid">
                {featuredArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
              
              {featuredArticles.length === 0 && (
                <div className="no-articles">
                  <p>Пока нет популярных статей. Будьте первым, кто создаст статью!</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/create-article')}
                  >
                    Создать статью
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Популярные направления */}
      <section className="destinations">
        <div className="container">
          <h2 className="section-title">Популярные направления</h2>
          <div className="destinations-grid">
            {popularDestinations.map((destination, index) => (
              <div 
                key={index} 
                className="destination-card hover-lift"
                onClick={() => handleDestinationClick(destination.name)}
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className="destination-image"
                  style={{ backgroundImage: `url(${destination.image})` }}
                >
                  <div className="destination-overlay"></div>
                  <h3 className="destination-name">{destination.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;