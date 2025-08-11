// frontend/src/features/posts/components/PostActions.tsx
import React, { useState, useEffect } from 'react';
import { PostExtended, UserWithAvatar } from '../../../types/globalTypes';
import { usePostActions } from '../hooks/usePostActions';
import { formatTimeElapsed } from '../../shared/utils/formatTimeElapsed';
import actionStyles from '../styles/actions.module.scss';
import PostCommentsModal from './PostCommentsModal';
import { useAppDispatch } from '../../../app/hook';
import { clearCommentsForPost } from '../postsSlice';

interface PostActionsProps {
  post: PostExtended;
  isAuthenticated: boolean;
  user: UserWithAvatar | null;
  commentTexts: Record<number, string>;
  setCommentTexts: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

const PostActions: React.FC<PostActionsProps> = (props) => {
  const {
    comments,
    commentsNext,
    handleLike,
    handleCommentSubmit,
    handleLoadMore,
    handleCommentTextareaChange,
    setEditCommentText,
    editingCommentId,
    editCommentText,
    isOwner,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    handleDelete,
  } = usePostActions(props);

  const { post } = props;
  const [modalOpen, setModalOpen] = useState(false);

  const dispatch = useAppDispatch();

  const commentList = comments[post.id] || [];
  const commentsNextUrl = commentsNext[post.id] || null;
  const commentText = props.commentTexts[post.id] || '';

  // Загружаем комментарии при первом открытии модалки
  useEffect(() => {
    if (modalOpen && commentList.length === 0) {
      handleLoadMore();
    }
    // eslint-disable-next-line
  }, [modalOpen]);

  // Обработчик закрытия модалки
  const handleCloseModal = () => {
    handleEditCancel();
    setModalOpen(false);
    dispatch(clearCommentsForPost(post.id));
  };

  return (
    <div>
      <div className={actionStyles.postActions}>
        <div className={actionStyles.likeComments}>
          <p onClick={handleLike}>
            <i className={`fas fa-heart ${actionStyles.heartIcon} ${post.liked ? actionStyles.liked : ''}`} />
            <span className={actionStyles.likeCount}>{post.likes_count}</span>
          </p>
          <p onClick={() => setModalOpen(true)}>
            <i className={`fas fa-comments ${actionStyles.commentsIcon}`}></i>
            <span className={actionStyles.commentsCount}>{post.comments_count}</span>
          </p>
        </div>
        <p className={actionStyles.timeElapsed}>{formatTimeElapsed(post.created_at)}</p>
      </div>

      {modalOpen && (
        <PostCommentsModal
          post={post}
          isAuthenticated={props.isAuthenticated}
          user={props.user}
          comments={commentList}
          commentsNext={commentsNextUrl}
          onClose={handleCloseModal}
          commentText={commentText}
          setCommentText={(text) => props.setCommentTexts((prev) => ({ ...prev, [post.id]: text }))} // Прокидываем setCommentText
          handleLike={handleLike}
          handleCommentTextareaChange={(e) =>
            props.setCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value })) // Обработчик изменения текста комментария
          }
          handleCommentSubmit={handleCommentSubmit}
          handleLoadMore={handleLoadMore}
          editingCommentId={editingCommentId}
          editCommentText={editCommentText}
          setEditCommentText={setEditCommentText}
          isOwner={isOwner}
          handleEditStart={handleEditStart}
          handleEditSave={handleEditSave}
          handleEditCancel={handleEditCancel}
          handleDelete={handleDelete}

          liked={!!post.liked}
          likesCount={post.likes_count ?? 0}
          commentsCount={post.comments_count ?? 0}
        />
      )}
    </div>
  );
};

export default PostActions;
