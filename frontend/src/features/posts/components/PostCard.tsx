// frontend/src/features/posts/components/PostCard.tsx
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import PostActions from './PostActions';
import type { PostExtended, UserWithAvatar } from '../../../types/globalTypes';
import styles from '../styles/feed.module.scss';
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
    <div className='post-feed' key={post.id}>
      <Link to={`/profile/${post.author.id}`} className='user-info'>
        {post.author.avatar && (
          <img
            src={post.author.avatar}
            alt="Аватар"
            className='post-feed-avatar-img'
          />
        )}
        <p className="post-feed-username">{post.author.username}</p>
      </Link>
      <Link to={`/post/${post.id}`} className="post-link">
        {post.image && <img src={post.image} alt="Пост изображение" className="post-feed-image" />}
        <p className="feed-post-body">{post.body}</p>
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
          <Link to={`/edit-post/${post.id}`} className="func-btn-1">Редактировать</Link>
          <button
            onClick={() => handleDeletePostClick && handleDeletePostClick(post.id)}
            className="delete-btn"
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
