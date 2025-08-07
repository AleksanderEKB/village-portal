import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlay, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import type { PostExtended, UserWithAvatar, PostComment } from '../../../types/globalTypes';
import modalStyles from '../styles/commentsModal.module.scss';

interface PostCommentsModalProps {
  post: PostExtended;
  isAuthenticated: boolean;
  user: UserWithAvatar | null;
  comments: PostComment[];
  commentsNext: string | null;
  onClose: () => void;
  commentText: string;
  setCommentText: (value: string) => void;
  handleLike: () => void;
  handleCommentTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleCommentSubmit: () => void;
  handleLoadMore: () => void;
  editingCommentId: number | null;
  editCommentText: string;
  setEditCommentText: (v: string) => void;
  isOwner: (comment: PostComment) => boolean;
  handleEditStart: (comment: PostComment) => void;
  handleEditSave: (comment: PostComment) => void;
  handleEditCancel: () => void;
  handleDelete: (comment: PostComment) => void;
  liked: boolean;
  likesCount: number;
  commentsCount: number;
}

const PostCommentsModal: React.FC<PostCommentsModalProps> = ({
  post,
  isAuthenticated,
  user,
  comments,
  commentsNext,
  onClose,
  commentText,
  setCommentText,
  handleLike,
  handleCommentTextareaChange,
  handleCommentSubmit,
  handleLoadMore,
  editingCommentId,
  editCommentText,
  setEditCommentText,
  isOwner,
  handleEditStart,
  handleEditSave,
  handleEditCancel,
  handleDelete,
  liked,
  likesCount,
  commentsCount,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div className={modalStyles.modalBackdrop}>
      <div className={modalStyles.modalContent} ref={modalRef}>
        <button className={modalStyles.closeBtn} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className={modalStyles.topBar}>
          <div className={modalStyles.likesBlock} onClick={handleLike}>
            <i className={`fas fa-heart ${modalStyles.heartIcon} ${liked ? modalStyles.liked : ''}`} />
            <span>{likesCount}</span>
          </div>
          <div className={modalStyles.commentsBlock}>
            <i className={`fas fa-comments ${modalStyles.commentsIcon}`} />
            <span>{commentsCount}</span>
          </div>
        </div>

        <div className={modalStyles.commentsList}>
          {comments.map((comment, index) => (
            <div
              key={comment.id}
              className={`${modalStyles.comment} ${index % 2 === 0 ? modalStyles.slideInLeft : modalStyles.slideInRight}`}
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div className={modalStyles.commentHeader}>
                <Link
                  to={`/profile/${typeof comment.author !== 'number' ? comment.author.id : comment.author}`}
                  className={modalStyles.authorLink}
                >
                  {typeof comment.author !== 'number' && comment.author.avatar && (
                    <img src={comment.author.avatar} alt="Аватар" className={modalStyles.avatarImg} />
                  )}
                  <span>{typeof comment.author !== 'number' ? comment.author.username : 'Пользователь'}</span>
                </Link>
                {isOwner(comment) && (
                  <div className={modalStyles.commentActions}>
                    <button
                      className={modalStyles.actionBtn}
                      onClick={() => handleEditStart(comment)}
                      title="Редактировать"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button
                      className={modalStyles.actionBtn}
                      onClick={() => handleDelete(comment)}
                      title="Удалить"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                )}
              </div>

              {editingCommentId === comment.id ? (
                <div className={modalStyles.editBlock}>
                  <textarea
                    value={editCommentText}
                    onChange={e => setEditCommentText(e.target.value)}
                    className={modalStyles.editTextarea}
                    autoFocus
                  />
                  <div className={modalStyles.editBtns}>
                    <button onClick={() => handleEditSave(comment)} className={modalStyles.saveBtn}>Сохранить</button>
                    <button onClick={handleEditCancel} className={modalStyles.cancelBtn}>Отмена</button>
                  </div>
                </div>
              ) : (
                <div className={modalStyles.commentBodyBlock}>
                  <div className={modalStyles.commentBody}>{comment.body}</div>
                </div>
              )}
            </div>
          ))}
          {commentsNext && (
            <button className={modalStyles.loadMoreBtn} onClick={handleLoadMore}>Показать ещё</button>
          )}
        </div>

        {isAuthenticated && user && (
          <div className={modalStyles.addComment}>
            <textarea
              value={commentText}
              onChange={handleCommentTextareaChange}
              placeholder="Введите текст комментария"
              required
              style={{ resize: 'none', overflow: 'hidden' }}
            />
            <button onClick={handleCommentSubmit} className={modalStyles.sendBtn}>
              <FontAwesomeIcon icon={faPlay} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCommentsModal;
