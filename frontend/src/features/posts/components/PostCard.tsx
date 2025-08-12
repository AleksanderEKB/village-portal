// frontend/src/features/posts/components/PostCard.tsx
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import PostActions from './PostActions';
import type { PostExtended, UserWithAvatar } from '../../../types/globalTypes';
import cardStyles from '../styles/card.module.scss';

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
  imageMode?: 'feed' | 'page';
}

const DEFAULT_POST_IMAGE = '/media/default/post.webp';
const DEFAULT_AVATAR = '/media/default/avatar.webp';

const PostCard: React.FC<PostCardProps> = ({
  post,
  isAuthenticated,
  user,
  commentTexts,
  setCommentTexts,
  children,
  handleDeletePostClick,
  showEditDeleteButtons = false,
  imageMode = 'feed',
}) => {
  const isOwner = isAuthenticated && user && user.id === post.author.id;

  const postImageWrapperClass =
    imageMode === 'feed'
      ? cardStyles.postImageWrapperFeed
      : cardStyles.postImageWrapperPage;

  const postImageClass =
    imageMode === 'feed' ? cardStyles.postFeedImg : cardStyles.postPageImg;

  return (
    <div className={cardStyles.cardContent} key={post.id}>
      <Link to={`/profile/${post.author.id}`} className={cardStyles.userInfo}>
        <img
          src={post.author.avatar || DEFAULT_AVATAR}
          alt="Аватар"
          className={cardStyles.cardContentAvatarImg}
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            if (img.src !== DEFAULT_AVATAR) {
              img.onerror = null; // предотвращаем цикл
              img.src = DEFAULT_AVATAR;
            }
          }}
        />
        <p className={cardStyles.userName}>{post.author.username}</p>
      </Link>

      <Link to={`/post/${post.id}`} className={cardStyles.postLink}>
        <div className={postImageWrapperClass}>
          <img
            src={post.image || DEFAULT_POST_IMAGE}
            alt="Пост изображение"
            className={postImageClass}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (img.src !== DEFAULT_POST_IMAGE) {
                img.onerror = null; // предотвращаем цикл
                img.src = DEFAULT_POST_IMAGE;
              }
            }}
          />
        </div>

        <p className={cardStyles.feedPostBody}>{post.body}</p>
      </Link>

      <PostActions
        post={post}
        isAuthenticated={isAuthenticated}
        user={user}
        commentTexts={commentTexts}
        setCommentTexts={setCommentTexts}
      />

      {children}

      {showEditDeleteButtons && isOwner && (
        <>
          <hr />
          <Link to={`/edit-post/${post.id}`} className={cardStyles.greyBtn}>
            Редактировать
          </Link>
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
