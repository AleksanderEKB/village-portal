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
import feedStyles from '../styles/feed.module.scss';


const PostFeed: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const posts = useSelector((state: RootState) => state.posts.posts);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const user = useSelector((state: RootState) => state.auth.user);
    const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
    const [showComments, setShowComments] = useState<Record<number, boolean>>({});

    useEffect(() => { dispatch(fetchPosts()); }, [dispatch]);

    return (
        <div className={feedStyles.feedContainer}>
            <h1>Лента постов</h1>
            <div className={feedStyles.feedContent}>
                {isAuthenticated && (
                    <div className={feedStyles.centerBtn}>
                        <Link to="/create-post" className={feedStyles.grayBtn}>
                            Создать пост
                        </Link>
                    </div>
                )}
                {/* Потом сделать {loading && <div>Загрузка...</div>}
                {error && <div className="error">{error}</div>} */}
                <div className={feedStyles.feedGrid}>
                    {posts.map(post => (
                        <div className={feedStyles.feedCard}>
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PostFeed;