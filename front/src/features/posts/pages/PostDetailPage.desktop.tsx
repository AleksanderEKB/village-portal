// front/src/features/posts/pages/PostDetailPage.desktop.tsx
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

const PostDetailPageDesktop: React.FC = () => {
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

  // Desktop: новые комментарии сверху
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
          <div className={styles.detailGrid}>
            {/* Левая колонка — изображение */}
            <ImageBlock image={post.image} onOpen={() => setViewerOpen(true)} />

            {/* Правая колонка — автор, экшены, РЕДАКТОР (только при editing), комментарии */}
            <div className={styles.detailRight}>
              <AuthorHeader author={post.author} created={post.created} />

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

              {editing && (
                <ContentEditor
                  draft={draft}
                  setDraft={setDraft}
                  onSave={onSaveEdit}
                  onCancel={onCancelEdit}
                />
              )}

              <CommentsBlock
                comments={comments}
                isAuth={isAuth}
                value={text}
                onChange={setText}
                onSubmit={onSubmitComment}
                disabled={commenting}
              />
            </div>
          </div>

          {/* ВАЖНО: при НЕ редактировании контент — отдельным блоком ниже сетки (как в исходной версии) */}
          {!editing && <ContentViewer content={post.content} />}

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

export default PostDetailPageDesktop;
