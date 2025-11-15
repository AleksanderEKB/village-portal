// front/src/features/posts/pages/PostsFeedPage.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hook';
import { fetchPostsThunk } from '../model/slice';
import PostCard from '../ui/PostCard';
import CreatePostForm from '../ui/CreatePostForm';
import styles from './postFeedPage.module.scss';

const PostsFeedPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const posts = useAppSelector((s) => s.posts.list);
  const loading = useAppSelector((s) => s.posts.loading);

  useEffect(() => {
    dispatch(fetchPostsThunk());
  }, [dispatch]);

  return (
    <div className={styles.feed}>
      <div className={styles.createFormWrapper}>
        <CreatePostForm />
      </div>

      {loading && <div className={styles.status}>Загрузка…</div>}

      {!loading && posts.length === 0 ? (
        <div className={styles.empty}>Постов пока нет</div>
      ) : (
        <div className={styles.grid}>
          {posts.map((p) => (
            <PostCard key={p.id} post={p} variant="feed" />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsFeedPage;
