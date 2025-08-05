import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { PostExtended, UserWithAvatar, PostComment } from '../../../types/globalTypes';
import { usePostActions } from '../hooks/usePostActions';
import { formatTimeElapsed } from '../../shared/utils/formatTimeElapsed';
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

const PostActions: React.FC<PostActionsProps> = (props) => {
  const {
    comments,
    commentsNext,
    visibleComments,
    isHiding,
    editingCommentId,
    editCommentText,
    fadingComments,
    commentTextareaRef,
    handleLike,
    handleShowCommentsClick,
    handleCommentTextareaChange,
    handleCommentSubmit,
    handleLoadMore,
    isOwner,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    handleDelete,
    setEditCommentText,
  } = usePostActions(props);

  const { post, isAuthenticated, user, showComments, commentTexts } = props;

  return (
    <div>
      <div className={actionStyles.postActions}>
        <div className={actionStyles.likeComments}>
          <p onClick={handleLike}>
            <i className={`fas fa-heart ${actionStyles.heartIcon} ${post.liked ? actionStyles.liked : ''}`} />
            <span className={actionStyles.likeCount}>{post.likes_count}</span>
          </p>
          <p onClick={handleShowCommentsClick}>
            <i className={`fas fa-comments ${actionStyles.commentsIcon}`}></i>
            <span className={actionStyles.commentsCount}>{post.comments_count}</span>
          </p>
        </div>
        <p className={actionStyles.timeElapsed}>{formatTimeElapsed(post.created_at)}</p>
      </div>

      {visibleComments && (
        <div className={actionStyles.commentSection}>
          <div
            className={`
              ${actionStyles.commentList}
              ${showComments[post.id] && !isHiding ? actionStyles.visible : actionStyles.hidden}
            `}
          >
            {comments[post.id] && comments[post.id].map((comment: PostComment, index: number) => (
              <div
                key={comment.id}
                className={`
                  ${actionStyles.comment}
                  ${fadingComments.includes(comment.id) ? actionStyles.fadeOut : ''}
                `}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link to={`/profile/${typeof comment.author !== "number" ? comment.author.id : comment.author}`} className={actionStyles.postFeedHeader} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {typeof comment.author !== 'number' && comment.author.avatar && (
                    <img src={comment.author.avatar} alt="Аватар" className={actionStyles.postAvatarImg} />
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
                    <p className={actionStyles.commentBody}>{comment.body}</p>
                    {isOwner(comment) && (
                      <div className={actionStyles.commentActions}>
                        <button className={actionStyles.actionBtn} onClick={() => handleEditStart(comment)}>
                          <FontAwesomeIcon className={actionStyles.actionIcon} icon={faPenToSquare}/>
                        </button>
                        <button className={actionStyles.actionBtn} onClick={() => handleDelete(comment)}>
                          <FontAwesomeIcon className={actionStyles.actionIcon} icon={faTrash} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          {isAuthenticated && user && (
            <div className={actionStyles.addComment}>
              <textarea
                ref={commentTextareaRef}
                value={commentTexts[post.id] || ''}
                onChange={handleCommentTextareaChange}
                placeholder="Введите текст комментария"
                required
                style={{ resize: 'none', overflow: 'hidden' }}
              />
              <p onClick={handleCommentSubmit}>
                <FontAwesomeIcon icon={faPlay} className={actionStyles.playIcon} />
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
