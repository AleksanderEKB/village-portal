import React, { useState, useEffect } from 'react';
import { PostExtended, UserWithAvatar } from '../../../types/globalTypes';
import { usePostActions } from '../hooks/usePostActions';
import { formatTimeElapsed } from '../../shared/utils/formatTimeElapsed';
import actionStyles from '../styles/actions.module.scss';
import PostCommentsModal from './PostCommentsModal';

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
  } = usePostActions(props);

  const { post } = props;
  const [modalOpen, setModalOpen] = useState(false);

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
          onClose={() => setModalOpen(false)}
          commentText={commentText}
          setCommentText={text => props.setCommentTexts(prev => ({ ...prev, [post.id]: text }))}
          handleLike={handleLike}
          handleCommentTextareaChange={e => props.setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
          handleCommentSubmit={handleCommentSubmit}
          handleLoadMore={handleLoadMore}
          liked={!!post.liked}
          likesCount={post.likes_count ?? 0}
          commentsCount={post.comments_count ?? 0}
        />
      )}
    </div>
  );
};

export default PostActions;
