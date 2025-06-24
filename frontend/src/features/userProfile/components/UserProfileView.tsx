import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchUserProfile } from '../userProfileSlice';
import PostCard from '../../posts/components/PostCard';
import type { RootState } from '../../../app/store';
import type { Advertisement } from '../../../types/globalTypes';
import '../styles.scss';
import { useAppDispatch } from '../../../app/hook';

const UserProfileView: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const dispatch = useAppDispatch();

    const { profile, loading } = useSelector((state: RootState) => state.userProfile);

    const posts = useSelector((state: RootState) =>
        state.posts.posts.filter(post => String(post.author.id) === userId)
    );

    // Получаем объявления этого пользователя
    const userAds = useSelector((state: RootState) =>
        state.ads.ads.filter(ad => String(ad.user.id) === String(userId))
    );

    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const user = useSelector((state: RootState) => state.auth.user);

    const [showComments, setShowComments] = useState<Record<number, boolean>>({});
    const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});

    useEffect(() => {
        if (userId) dispatch(fetchUserProfile(userId));
    }, [dispatch, userId]);

    if (loading || !profile) return <p>Загрузка...</p>;

    return (
        <div className='user-profile-content'>
            <div className="profile-container">
                <h1>Профиль пользователя</h1>
                <div className='profile-details'>
                    <div>
                        <img
                            src={profile.avatar || '/media/avatars/default.webp'}
                            alt="Аватар"
                            className='avatar-img'
                        />
                        <h2>{profile.username}</h2>
                    </div>
                </div>
            </div>
            <div className="posts-feed">
                {posts.length === 0 && <p>У пользователя пока нет постов.</p>}
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
            <div className="ads-feed">
                <h1>Объявления пользователя</h1>
                {userAds.length === 0 && <p>У пользователя пока нет объявлений.</p>}
                {userAds.map((ad: Advertisement) => (
                    <div key={ad.id} className="ad-card">
                        <a href={`/ads/${ad.slug}`}>
                            <img
                                src={ad.main_image || '/media/ads/default.webp'}
                                alt={ad.title}
                                className="ad-main-img"
                            />
                            <h2>{ad.title}</h2>
                        </a>
                        <p>Категория: {ad.category}</p>
                        <p>Цена: {ad.price || '—'}</p>
                        <p>{ad.description.slice(0, 100)}...</p>
                        <a href={`/ads/${ad.slug}`} className="create-post-button">Открыть</a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserProfileView;
