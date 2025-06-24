// frontend/src/features/posts/components/PostFeed.tsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import PostCard from './PostCard';
import { fetchPosts } from '../postsSlice';
import type { RootState, AppDispatch } from '../../../app/store';
import '../styles.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-toastify/dist/ReactToastify.css';


const PostFeed: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const posts = useSelector((state: RootState) => state.posts.posts);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const user = useSelector((state: RootState) => state.auth.user);
    const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
    const [showComments, setShowComments] = useState<Record<number, boolean>>({});

    useEffect(() => { dispatch(fetchPosts()); }, [dispatch]);

    return (
        <div className="posts-feed">
            <h1>Лента постов</h1>
            {isAuthenticated && (
                <Link to="/create-post" className="func-btn-1">
                    Создать пост
                </Link>
            )}
            {posts.map(post => (
                <PostCard
                    key={post.id}
                    post={post}
                    isAuthenticated={isAuthenticated}
                    user={user}
                    showComments={showComments}
                    setShowComments={setShowComments}
                    commentTexts={commentTexts}
                    setCommentTexts={setCommentTexts}
                />
            ))}
        </div>
    );
};

export default PostFeed;
