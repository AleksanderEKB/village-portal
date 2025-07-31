// frontend/src/features/posts/components/PostCard.tsx
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import PostActions from './PostActions';
import type { PostExtended, UserWithAvatar } from '../../../types/globalTypes';
import cardStyles from '../styles/card.module.scss';
import '../styles.scss';

interface PostCardProps {
  post: PostExtended;
  isAuthenticated: boolean;
  user: UserWithAvatar | null;
  showComments: Record<number, boolean>;
  setShowComments: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  commentTexts: Record<number, string>;
  setCommentTexts: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  children?: ReactNode;
  handleDeletePostClick?: (id: number) => void;
  showEditDeleteButtons?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  isAuthenticated,
  user,
  showComments,
  setShowComments,
  commentTexts,
  setCommentTexts,
  children,
  handleDeletePostClick,
  showEditDeleteButtons = false,
}) => {
  const isOwner = isAuthenticated && user && user.id === post.author.id;

  return (
    <div className={cardStyles.cardContent} key={post.id}>
      <Link to={`/profile/${post.author.id}`} className={cardStyles.userInfo}>
        {post.author.avatar && (
          <img
            src={post.author.avatar}
            alt="Аватар"
            className={cardStyles.cardContentAvatarImg}
          />
        )}
        <p className={cardStyles.userName}>{post.author.username}</p>
      </Link>
      <Link to={`/post/${post.id}`} className={cardStyles.postLink}>
        {post.image && <img src={post.image} alt="Пост изображение" className={cardStyles.postFeedImg} />}
        <p className={cardStyles.feedPostBody}>{post.body}</p>
      </Link>
      <PostActions
        post={post}
        isAuthenticated={isAuthenticated}
        user={user}
        showComments={showComments}
        setShowComments={setShowComments}
        commentTexts={commentTexts}
        setCommentTexts={setCommentTexts}
      />
      {children}
      {showEditDeleteButtons && isOwner && (
        <>
          <hr />
          <Link to={`/edit-post/${post.id}`} className={cardStyles.greyBtn}>Редактировать</Link>
          <button
            onClick={() => handleDeletePostClick && handleDeletePostClick(post.id)}
            className={cardStyles.greyBtn}
          >
            Удалить
          </button>
          <hr />
        </>
      )}
    </div>
  );
};

export default PostCard;
