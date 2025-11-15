// front/src/features/posts/pages/PostDetailPage.mobile.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../ui/posts.module.scss';
import { usePostDetail } from '../model/hooks/usePostDetail';
import { useComments } from '../model/hooks/useComments';
import { AuthorHeader } from '../ui/detail/AuthorHeader';
import { ActionBar } from '../ui/detail/ActionBar';
import { ImageBlock } from '../ui/detail/ImageBlock';
import { ContentEditor } from '../ui/detail/ContentEditor';
import { ContentViewer } from '../ui/detail/ContentViewer';
import { CommentsBlock } from '../ui/detail/CommentsBlock';

const PostDetailPageMobile: React.FC = () => {
  const {
    id,
    post,
    isAuth,
    isOwner,
    toggling,

    menuOpen,
    setMenuOpen,

    editing,
    draft,
    setDraft,

    viewerOpen,
    setViewerOpen,

    onEditClick,
    onDeleteClick,
    onSaveEdit,
    onCancelEdit,
    onLike,
  } = usePostDetail();

  // Mobile: новые комментарии сверху (фикс пункта 4)
  const { comments, text, setText, commenting, onSubmitComment } = useComments(id, true);

  if (!id) return null;

  return (
    <div className={styles.detailPage}>
      <Link to="/posts" className={styles.backLink}>
        ← К ленте
      </Link>

      {!post ? (
        <div className={styles.notFound}>Пост не найден или был удалён.</div>
      ) : (
        <>
          {/* 1. Автор */}
          <AuthorHeader author={post.author} created={post.created} />

          {/* 2. Опции и лайк */}
          <ActionBar
            isOwner={isOwner}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            editing={editing}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            isAuth={isAuth}
            toggling={Boolean(toggling)}
            isLiked={post.is_liked}
            likesCount={post.likes_count}
            onLike={onLike}
          />

          {/* 3. Изображение */}
          <ImageBlock image={post.image} onOpen={() => setViewerOpen(true)} />

          {/* 4. Контент / Редактирование — в том же месте, как было на мобиле */}
          {editing ? (
            <ContentEditor
              draft={draft}
              setDraft={setDraft}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
            />
          ) : (
            <ContentViewer content={post.content} />
          )}

          {/* 5. Комментарии */}
          <CommentsBlock
            comments={comments}
            isAuth={isAuth}
            value={text}
            onChange={setText}
            onSubmit={onSubmitComment}
            disabled={commenting}
          />

          {viewerOpen && post.image && (
            <div
              className={styles.fullscreenOverlay}
              onClick={() => setViewerOpen(false)}
              role="button"
              aria-label="Закрыть просмотр"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Escape' && setViewerOpen(false)}
            >
              <img src={post.image} alt="" className={styles.fullscreenImage} />
              <button
                type="button"
                className={styles.fullscreenClose}
                onClick={() => setViewerOpen(false)}
              >
                ✕
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostDetailPageMobile;
