import React from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../../posts/components/PostCard';
import type { PostExtended, UserWithAvatar } from '../../../types/globalTypes';

interface PostsBlockProps {
  myPosts: PostExtended[];
  isAuthenticated: boolean;
  profile: UserWithAvatar;
  showComments: Record<number, boolean>;
  setShowComments: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  commentTexts: Record<number, string>;
  setCommentTexts: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  handleDeletePostClick: (id: number) => void;
}

const PostsBlock: React.FC<PostsBlockProps> = ({
  myPosts,
  isAuthenticated,
  profile,
  showComments,
  setShowComments,
  commentTexts,
  setCommentTexts,
  handleDeletePostClick,
}) => (
  <div className="posts-feed">
    <h1>Мои посты</h1>
    <Link to="/create-post" className="func-btn-1">Создать пост</Link>
    {myPosts.map(post => (
      <PostCard
        key={post.id}
        post={post}
        isAuthenticated={isAuthenticated}
        user={profile}
        showComments={showComments}
        setShowComments={setShowComments}
        commentTexts={commentTexts}
        setCommentTexts={setCommentTexts}
        showEditDeleteButtons={true}
        handleDeletePostClick={handleDeletePostClick}
      />
    ))}
  </div>
);

export default PostsBlock;
