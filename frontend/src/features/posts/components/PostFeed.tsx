import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import PostCard from './PostCard';
import { fetchPosts } from '../postsSlice';
import type { RootState, AppDispatch } from '../../../app/store';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import feedStyles from '../styles/feed.module.scss';

import '../styles.scss'; // потом убрать

const ITEMS_PER_PAGE = 4;

const PostFeed: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const posts = useSelector((state: RootState) => state.posts.posts);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const user = useSelector((state: RootState) => state.auth.user);
    const loading = useSelector((state: RootState) => state.posts.loading);
    const error = useSelector((state: RootState) => state.posts.error);
    const count = useSelector((state: RootState) => state.posts.count);

    const [commentTexts, setCommentTexts] = React.useState<Record<number, string>>({});
    const [showComments, setShowComments] = React.useState<Record<number, boolean>>({});

    // При заходе на страницу — подгружаем первые N постов
    useEffect(() => {
        dispatch(fetchPosts({ limit: ITEMS_PER_PAGE, offset: 0 }));
        // eslint-disable-next-line
    }, [dispatch]);

    // Подгрузка следующих N постов
    const handleShowMore = () => {
        dispatch(fetchPosts({ limit: ITEMS_PER_PAGE, offset: posts.length }));
    };

    return (
        <div className={feedStyles.feedContainer}>
            <h1>Лента постов</h1>
            <div className={feedStyles.feedContent}>
                {isAuthenticated && (
                    <div className={feedStyles.centerBtn}>
                        <Link to="/create-post" className={feedStyles.greyBtn}>
                            Создать пост
                        </Link>
                    </div>
                )}

                {loading && posts.length === 0 && <div>Загрузка...</div>}
                {error && <div className={feedStyles.error}>{error}</div>}

                <div className={feedStyles.feedGrid}>
                    {posts.map(post => (
                        <div className={feedStyles.feedCard} key={post.id}>
                            <PostCard
                                post={post}
                                isAuthenticated={isAuthenticated}
                                user={user}
                                showComments={showComments}
                                setShowComments={setShowComments}
                                commentTexts={commentTexts}
                                setCommentTexts={setCommentTexts}
                                imageMode="feed"
                            />
                        </div>
                    ))}
                </div>

                {/* Кнопка "Показать ещё" если есть что ещё грузить */}
                {posts.length < (count || 0) && (
                    <div className={feedStyles.centerBtn}>
                        <button
                            className={feedStyles.grayBtn}
                            onClick={handleShowMore}
                            disabled={loading}
                        >
                            {loading ? 'Загрузка...' : 'Показать ещё'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostFeed;
