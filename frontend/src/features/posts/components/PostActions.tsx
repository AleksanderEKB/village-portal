// frontend/src/features/posts/components/PostActions.tsx

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../app/hook';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { RootState } from '../../../app/store';
import { fetchComments, createComment, likePost, updateComment, deleteComment } from '../postsSlice';
import { formatTimeElapsed } from '../../shared/utils/formatTimeElapsed';
import { PostExtended, UserWithAvatar, PostComment } from '../../../types/globalTypes';
import { toast } from 'react-toastify';
import '../../shared/styles/general.scss';
import actionStyles from '../styles/actions.module.scss';

interface PostActionsProps {
  post: PostExtended;
  isAuthenticated: boolean;
  user: UserWithAvatar | null;
  showComments: Record<number, boolean>;
  setShowComments: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  commentTexts: Record<number, string>;
  setCommentTexts: React.Dispatch<React.SetStateAction<Record<number, string>>>; 
}

const PostActions: React.FC<PostActionsProps> = ({
  post,
  isAuthenticated,
  user,
  showComments,
  setShowComments,
  commentTexts,
  setCommentTexts,
}) => {
  const dispatch = useAppDispatch();
  const comments = useSelector((state: RootState) => state.posts.comments);
  const commentsNext = useSelector((state: RootState) => state.posts.commentsNext);

  const handleLike = () => {
    if (!isAuthenticated || !user) {
      alert('Хочешь лайкнуть — авторизуйся или зарегистрируйся!');
      return;
    }
    if (user.id === post.author.id) {
      toast.error('Свои посты не лайкаем');
      return;
    }
    dispatch(likePost({ postId: post.id, isLiked: !!post.liked }));
  };

  const handleShowCommentsClick = () => {
    if (!showComments[post.id]) {
      dispatch(fetchComments({ postId: post.id, offset: 0 }));
    }
    setShowComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }));
  };

  const handleCommentInputChange = (value: string) => {
    setCommentTexts((prev) => ({ ...prev, [post.id]: value }));
  };

  const handleCommentSubmit = () => {
    if (!isAuthenticated || !user) return;
    const text = commentTexts[post.id];
    if (text && text.trim()) {
      dispatch(createComment({ postId: post.id, commentData: { body: text, author: user.id, post: post.id } }));
      setCommentTexts((prev) => ({ ...prev, [post.id]: '' }));
    }
  };

  const handleLoadMore = () => {
    const currentComments = comments[post.id] || [];
    const offset = currentComments.length;
    dispatch(fetchComments({ postId: post.id, offset }));
  };

  // --- Новое для редактирования/удаления ---
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState<string>('');

  const isOwner = (comment: PostComment) => {
    if (!user) return false;
    if (typeof comment.author !== "number" && comment.author.id) {
      return user.id === comment.author.id;
    }
    return false;
  };

  const handleEditStart = (comment: PostComment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.body);
  };

  const handleEditSave = (comment: PostComment) => {
    dispatch(updateComment({ postId: post.id, commentId: comment.id, commentData: { body: editCommentText } }));
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleDelete = (comment: PostComment) => {
    if (window.confirm('Удалить комментарий?')) {
      dispatch(deleteComment({ postId: post.id, commentId: comment.id }));
    }
  };

  // --- Ссылки на редактирование/создание ---
  const isPostAuthor = user?.id === post.author.id;

  return (
    <div>
      <div className='post-actions'>
        <div className="like-comments">
          <p className='like' onClick={handleLike}>
            <i className={`fas fa-heart heart-icon ${post.liked ? 'liked' : ''}`}></i>
            <span className="like-count">{post.likes_count}</span>
          </p>
          <p className='comments' onClick={handleShowCommentsClick}>
            <i className="fas fa-comments comments-icon"></i>
            <span className="comments-count">{post.comments_count}</span>
          </p>
        </div>
        <p className='time-elapsed'>{formatTimeElapsed(post.created_at)}</p>

        {/* Ссылки на создание или редактирование поста */}
        {isPostAuthor && (
          <div className="post-actions-links">
            <Link to={`/edit-post/${post.id}`} className="post-action-link">
              Редактировать пост
            </Link>
          </div>
        )}
        {!isPostAuthor && isAuthenticated && (
          <div className="post-actions-links">
            <Link to="/create-post" className="post-action-link">
              Создать новый пост
            </Link>
          </div>
        )}
      </div>

      {showComments[post.id] && (
        <div className="comments-section">
          <div className="comments-list">
            {comments[post.id] && comments[post.id].map((comment: PostComment, index: number) => (
              <div key={comment.id} className="comment" style={{ animationDelay: `${index * 0.1}s` }}>
                <Link to={`/profile/${typeof comment.author !== "number" ? comment.author.id : comment.author}`} className="post-feed-header" style={{ textDecoration: 'none', color: 'inherit' }}>
                  {typeof comment.author !== 'number' && comment.author.avatar && (
                    <img src={comment.author.avatar} alt="Аватар" className={actionStyles.postFeedImg} />
                  )}
                  <p>{typeof comment.author !== 'number' ? comment.author.username : 'Пользователь'}</p>
                </Link>
                {editingCommentId === comment.id ? (
                  <>
                    <textarea
                      value={editCommentText}
                      onChange={e => setEditCommentText(e.target.value)}
                    />
                    <button onClick={() => handleEditSave(comment)}>Сохранить</button>
                    <button onClick={handleEditCancel}>Отмена</button>
                  </>
                ) : (
                  <>
                    <p>{comment.body}</p>
                    {isOwner(comment) && (
                      <div className="comment-actions">
                        <button onClick={() => handleEditStart(comment)}>✎</button>
                        <button onClick={() => handleDelete(comment)}>🗑</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          {isAuthenticated && user && (
            <div className="add-comment">
              <textarea
                value={commentTexts[post.id] || ''}
                onChange={(e) => handleCommentInputChange(e.target.value)}
                placeholder="Написать комментарий"
              />
              <p onClick={handleCommentSubmit}>
                <FontAwesomeIcon icon={faPlay} />
              </p>
            </div>
          )}
          {(commentsNext[post.id]) && (
            <button className="load-more-btn" onClick={handleLoadMore}>Показать ещё</button>
          )}
        </div>
      )}
    </div>
  );
};

export default PostActions;
