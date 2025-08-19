// frontend/src/features/posts/components/PostCard.tsx
import React, { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PostActions from './PostActions';
import type { PostExtended, UserWithAvatar } from '../../../types/globalTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import UserInfo from '../../shared/corpusculars/UserInfo/UserInfo';

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

  const navigate = useNavigate();

  return (
    <div className={cardStyles.cardContent} key={post.id}>
      <UserInfo user={post.author} />
      <Link to={`/post/${post.id}`} className={cardStyles.postLink}>
        <div className={postImageWrapperClass}>
          <img
            src={post.image || DEFAULT_POST_IMAGE}
            alt="Пост изображение"
            className={postImageClass}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (img.src !== DEFAULT_POST_IMAGE) {
                img.onerror = null;
                img.src = DEFAULT_POST_IMAGE;
              }
            }}
          />
        </div>

        <p
          className={
            imageMode === 'feed'
              ? `${cardStyles.feedPostBody} ${cardStyles.feedPostBodyOneLine}`
              : cardStyles.feedPostBody
          }
          title={post.body} // чтобы при наведении видеть полный текст
        >
          {post.body}
        </p>
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
          <div className={cardStyles.postActions}>
            <button
              type="button"
              className={cardStyles.actionBtn}
              onClick={() => navigate(`/edit-post/${post.id}`)}
              title="Редактировать"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>
            <button
              onClick={() => handleDeletePostClick && handleDeletePostClick(post.id)}
              className={cardStyles.actionBtn}
              title="Удалить"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
          <hr />
        </>
      )}
    </div>
  );
};

export default PostCard;
