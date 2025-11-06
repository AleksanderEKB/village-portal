// front/src/features/posts/pages/PostDetailPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hook';
import {
  addCommentThunk,
  fetchCommentsThunk,
  fetchPostThunk,
  deletePostThunk,
  updatePostThunk,
  toggleLikeThunk
} from '../model/slice';
import PostCard from '../ui/PostCard';
import { CommentForm, CommentList } from '../ui/CommentList';
import { selectIsAuth } from '../../auth/model/selectors';
import styles from '../ui/posts.module.scss';
import DropMenu from '../../shared/components/dropmenu/DropdownMenu';

const DEFAULT_AVATAR = '/media/default/default_avatar.jpeg';

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 60) return `${diff} мин назад`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h} ч назад`;
  return d.toLocaleDateString('ru-RU');
}

function useIsDesktop(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth >= breakpoint : false
  );
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isDesktop;
}

// front/src/features/posts/pages/PostDetailPage.tsx

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isDesktop = useIsDesktop(799);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const post = useAppSelector((s) => (id ? s.posts.byId[id] : undefined));
  const comments =
    useAppSelector((s) => (id ? s.posts.commentsByPost[id] : undefined)) || [];
  const commenting = useAppSelector((s) => (id ? s.posts.commenting[id] : false));
  const isAuth = useAppSelector(selectIsAuth);
  const meId = useAppSelector((s: any) => s?.auth?.user?.id);
  const isOwner = isAuth && meId && post?.author?.id && meId === post.author.id;
  const toggling = useAppSelector((s) => (id ? s.posts.togglingLike[id] : false));

  const [text, setText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post?.content || '');

  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchPostThunk({ id }));
    dispatch(fetchCommentsThunk({ postId: id }));
  }, [dispatch, id]);

  useEffect(() => {
    setDraft(post?.content || '');
  }, [post?.content]);

  const onSubmitComment = async () => {
    if (!id || !text.trim()) return;
    await dispatch(addCommentThunk({ postId: id, content: text.trim() })).unwrap();
    setText('');
  };

  const onEditClick = () => {
    setMenuOpen(false);
    setEditing(true);
  };

  const onDeleteClick = async () => {
    setMenuOpen(false);
    if (!post) return;
    if (!window.confirm('Удалить пост без возможности восстановления?')) return;
    await dispatch(deletePostThunk({ id: post.id })).unwrap();
    navigate('/posts');
  };

  const onSaveEdit = async () => {
    if (!post) return;
    await dispatch(updatePostThunk({ id: post.id, content: draft })).unwrap();
    setEditing(false);
  };

  const onCancelEdit = () => {
    setEditing(false);
    setDraft(post?.content || '');
  };

  const onLike = () => {
    if (!post || !isAuth || toggling) return;
    dispatch(toggleLikeThunk({ id: post.id }));
  };

  const orderedComments = useMemo(() => {
    return isDesktop ? [...comments].reverse() : comments;
  }, [comments, isDesktop]);

  useEffect(() => {
    if (!viewerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [viewerOpen]);

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
            <div className={styles.detailImageWrapper}>
              {post.image ? (
                <img
                  src={post.image}
                  alt="Post"
                  className={styles.detailImage}
                  onClick={() => setViewerOpen(true)}
                />
              ) : (
                <div className={styles.noImageStub}>Изображение отсутствует</div>
              )}
            </div>

            <div className={styles.detailRight}>
              <div className={styles.detailHeader}>
                <div className={styles.headerLeft}>
                  <img
                    src={post.author.avatar || DEFAULT_AVATAR}
                    alt="Author"
                    className={styles.avatar}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.875rem' }}>
                      {`${post.author.first_name} ${post.author.last_name}`.trim() ||
                        post.author.email}
                    </div>
                    <div className={styles.meta}>{formatTime(post.created)}</div>
                  </div>
                </div>
              </div>

              {/* Новая секция для лайков и меню */}
              <div className={styles.actionBlock}>
                {isOwner && (
                  <div className={styles.menuWrapper}>
                    <button
                      type="button"
                      className={styles.menuButton}
                      aria-haspopup="menu"
                      aria-expanded={menuOpen}
                      onClick={() => setMenuOpen((v) => !v)}
                    >
                    <img
                        src="/media/icons/ellipsis-solid-full.svg"
                        alt=""
                        style={{ width: 20, height: 20, display: 'block' }}
                      />                    </button>
                    <DropMenu
                      open={menuOpen}
                      style={{ right: 0, left: 'auto', transform: 'none' }}
                    >
                      {!editing && (
                        <button
                          type="button"
                          onClick={onEditClick}
                          style={{ width: '100%', textAlign: 'left', padding: '.5rem' }}
                        >
                          ✏️ Редактировать
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={onDeleteClick}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '.5rem',
                          color: '#d92d20'
                        }}
                      >
                        🗑 Удалить
                      </button>
                    </DropMenu>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onLike}
                  disabled={!isAuth || toggling}
                  className={`${styles.detailLikeBtn} ${post.is_liked ? styles.likeActive : ''}`}
                >
                  <img
                    src="/media/icons/heart-solid-full.svg"
                    alt=""
                    style={{ width: 20, height: 20, display: 'block' }}
                  />
                   {post.likes_count}
                </button>
              </div>

              {editing && (
                <div style={{ display: 'grid', gap: 8 }}>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className={styles.content}
                    style={{
                      border: '1px solid #ccd2d9',
                      borderRadius: 8,
                      padding: 8,
                      background: '#fff'
                    }}
                    placeholder="Текст поста"
                  />
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      style={{
                        border: 0,
                        background: '#eef2f7',
                        padding: '10px 14px',
                        borderRadius: 8,
                        cursor: 'pointer'
                      }}
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={onSaveEdit}
                      style={{
                        border: 0,
                        background: '#5865f2',
                        color: '#fff',
                        fontWeight: 700,
                        padding: '10px 14px',
                        borderRadius: 8,
                        cursor: 'pointer'
                      }}
                    >
                      Сохранить
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.detailComments}>
                {orderedComments.length === 0 ? (
                  <div className={styles.noComments}>Оставьте свой первый комментарий</div>
                ) : (
                  <CommentList comments={orderedComments} />
                )}

                {isAuth ? (
                  <div className={styles.detailCommentForm}>
                    <CommentForm
                      value={text}
                      onChange={setText}
                      onSubmit={onSubmitComment}
                      disabled={commenting}
                    />
                  </div>
                ) : (
                  <div style={{ color: '#999' }}>Войдите, чтобы комментировать</div>
                )}
              </div>
            </div>
          </div>

          {post.content ? (
            <div className={styles.detailContentBlock}>
              <div className={styles.content}>{post.content}</div>
            </div>
          ) : null}

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

export default PostDetailPage;
