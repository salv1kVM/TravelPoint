import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getArticleComments, 
  createComment, 
  deleteComment,
  updateComment 
} from '../../api/comments';
import './CommentSection.scss';

const CommentSection = ({ articleId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Загрузка комментариев
  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await getArticleComments(articleId);
      setComments(data);
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
    } finally {
      setLoading(false);
    }
  };

  // Отправить комментарий
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      const createdComment = await createComment(articleId, newComment);
      setComments([createdComment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Ошибка отправки комментария:', error);
      alert('Ошибка при отправке комментария');
    }
  };

  // Удалить комментарий
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Удалить комментарий?')) return;

    try {
      await deleteComment(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Ошибка удаления комментария:', error);
      alert('Ошибка при удалении комментария');
    }
  };

  // Начать редактирование
  const startEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  // Сохранить редактирование
  const handleSaveEdit = async (commentId) => {
    try {
      const updatedComment = await updateComment(commentId, editContent);
      setComments(comments.map(comment => 
        comment.id === commentId ? { ...comment, content: editContent } : comment
      ));
      setEditingCommentId(null);
      setEditContent('');
    } catch (error) {
      console.error('Ошибка редактирования:', error);
    }
  };

  // Отмена редактирования
  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  // Проверка прав
  const canEditComment = (comment) => {
    return isAuthenticated && (user?.id === comment.userId || user?.role === 'ADMIN');
  };

  const canDeleteComment = (comment) => {
    return isAuthenticated && (user?.id === comment.userId || user?.role === 'ADMIN');
  };

  if (loading) {
    return <div className="comment-loading">Загрузка комментариев...</div>;
  }

  return (
    <div className="comment-section">
      <h3 className="comment-title">Комментарии ({comments.length})</h3>

      {/* Форма добавления комментария */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишите ваш комментарий..."
            rows="3"
            className="comment-input"
          />
          <button 
            type="submit" 
            className="comment-submit-btn"
            disabled={!newComment.trim()}
          >
            Отправить
          </button>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <p>Войдите, чтобы оставить комментарий</p>
        </div>
      )}

      {/* Список комментариев */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">Пока нет комментариев. Будьте первым!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author">
                  <span className="author-name">
                    {comment.User?.username || 'Аноним'}
                  </span>
                  {comment.User?.role === 'ADMIN' && (
                    <span className="author-badge">👑 Админ</span>
                  )}
                </div>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>

              <div className="comment-content">
                {editingCommentId === comment.id ? (
                  <div className="comment-edit">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows="3"
                      className="edit-input"
                    />
                    <div className="edit-actions">
                      <button 
                        onClick={() => handleSaveEdit(comment.id)}
                        className="save-btn"
                      >
                        Сохранить
                      </button>
                      <button 
                        onClick={cancelEdit}
                        className="cancel-btn"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>{comment.content}</p>
                )}
              </div>

              {/* Кнопки действий */}
              {!editingCommentId && (
                <div className="comment-actions">
                  {canEditComment(comment) && (
                    <button 
                      onClick={() => startEdit(comment)}
                      className="action-btn edit-btn"
                    >
                      Редактировать
                    </button>
                  )}
                  {canDeleteComment(comment) && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="action-btn delete-btn"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;