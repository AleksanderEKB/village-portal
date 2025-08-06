import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../app/hook';
import { fetchPostById, deletePost } from '../postsSlice';
import PostCard from './PostCard';
import type { RootState } from '../../../app/store';
import pageStyles from '../styles/page.module.scss';

const PostPage: React.FC = () => {
    const { postId } = useParams<{ postId?: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const post = useSelector((state: RootState) => state.posts.post);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const user = useSelector((state: RootState) => state.auth.user);
    const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
    const [showComments, setShowComments] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (postId) {
            dispatch(fetchPostById(postId));
        } else {
            console.error('Invalid postId:', postId);
            navigate('/');
        }
    }, [dispatch, postId, navigate]);

    const handleDeletePostClick = (id: number) => {
        dispatch(deletePost(id));
        navigate('/');
    };

    if (!post) return <p>Загрузка...</p>;

    return (
        <div className={pageStyles.postPage}>
            <div className={pageStyles.postPageContent}>
                <PostCard
                    post={post}
                    isAuthenticated={isAuthenticated}
                    user={user}
                    showComments={showComments}
                    setShowComments={setShowComments}
                    commentTexts={commentTexts}
                    setCommentTexts={setCommentTexts}
                    showEditDeleteButtons={true}
                    handleDeletePostClick={handleDeletePostClick}
                    imageMode="page"
                />
            </div>
        </div>
    );
};

export default PostPage;
