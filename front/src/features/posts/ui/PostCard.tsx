// front/src/features/posts/ui/PostCard.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './posts.module.scss';
import type { Post } from '../model/types';
import { useAppDispatch, useAppSelector } from '../../../app/hook';
import { toggleLikeThunk, updatePostThunk, deletePostThunk } from '../model/slice';
import { selectIsAuth } from '../../auth/model/selectors';
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

/**
 * Клиентский фолбэк — на случай, если short_content ещё не приходит с API.
 */
function truncateSmart(input: string, max = 100): string {
  const s = (input ?? '').trim();
  if (s.length <= max) return s;
  const sub = s.slice(0, max);
  const space = sub.lastIndexOf(' ');
  const head = (space > 0 ? sub.slice(0, space) : sub).trimEnd();
  return head + '…';
}

type Props = {
  post: Post;
  variant?: 'feed' | 'detail';
};

const PostCard: React.FC<Props> = ({ post, variant = 'feed' }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuth = useAppSelector(selectIsAuth);

  const effectivePost = useAppSelector((s) => s.posts.byId[post.id] ?? post);
  const toggling = useAppSelector((s) => s.posts.togglingLike[post.id] || false);

  const meId = useAppSelector((s: any) => s?.auth?.user?.id);
  const isOwner = isAuth && meId && meId === post.author.id;

  const [menuOpen, setMenuOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(effectivePost.content);

  React.useEffect(() => {
    setDraft(effectivePost.content);
  }, [effectivePost.content]);

  React.useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [menuOpen]);

  React.useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [menuOpen]);

  const onLike = () => {
    if (!isAuth || toggling) return;
    dispatch(toggleLikeThunk({ id: post.id }));
  };

  const authorName =
    `${post.author.first_name} ${post.author.last_name}`.trim() || post.author.email;

  const onEditClick = () => {
    setMenuOpen(false);
    setEditing(true);
  };

  const onDeleteClick = async () => {
    setMenuOpen(false);
    if (!window.confirm('Удалить пост без возможности восстановления?')) return;
    await dispatch(deletePostThunk({ id: post.id })).unwrap();
    navigate('/posts');
  };

  const onSaveEdit = async () => {
    await dispatch(
      updatePostThunk({
        id: post.id,
        content: draft
      })
    ).unwrap();
    setEditing(false);
  };

  const onCancelEdit = () => {
    setEditing(false);
    setDraft(effectivePost.content);
  };

  const contentToRender = React.useMemo(() => {
    if (!effectivePost.content) return '';
    if (variant === 'detail') return effectivePost.content;
    if (effectivePost.short_content) return effectivePost.short_content;
    return truncateSmart(effectivePost.content, 100);
  }, [effectivePost.content, effectivePost.short_content, variant]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <img
            src={post.author.avatar || DEFAULT_AVATAR}
            alt=""
            className={styles.avatar}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: '.875rem' }}>
              {authorName}
            </div>
            <div className={styles.meta}>{formatTime(post.created)}</div>
          </div>
        </div>

        {isOwner && (
          <div className={styles.menuWrapper} ref={wrapperRef}>
            <button
              type="button"
              className={styles.menuButton}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              title="Действия"
            >
              ⋯
            </button>
            <DropMenu
              open={menuOpen}
              style={{ right: 0, left: 'auto', transform: 'none' }}
            >
              <button
                type="button"
                style={{ width: '100%', textAlign: 'left', padding: '.5rem', background: 'transparent', border: 0, cursor: 'pointer', borderRadius: 6 }}
                onClick={onEditClick}
              >
                ✏️ Редактировать
              </button>
              <button
                type="button"
                style={{ width: '100%', textAlign: 'left', padding: '.5rem', background: 'transparent', border: 0, cursor: 'pointer', borderRadius: 6, color: '#d92d20' }}
                onClick={onDeleteClick}
              >
                🗑 Удалить
              </button>
            </DropMenu>
          </div>
        )}
      </div>

      {!editing ? (
        <>
          <Link to={`/posts/${post.id}`}>
            {effectivePost.image && (
              <img
                src={effectivePost.image}
                alt=""
                className={variant === 'feed' ? styles.imageFeed : styles.imageDetail}
              />
            )}
          </Link>
          {contentToRender && <div className={styles.content}>{contentToRender}</div>}
        </>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={styles.content}
            style={{ border: '1px solid #ccd2d9', borderRadius: 8, padding: 8 }}
            placeholder="Текст поста"
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancelEdit} style={{ border: 0, background: '#eef2f7', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}>
              Отмена
            </button>
            <button type="button" onClick={onSaveEdit} style={{ border: 0, background: '#5865f2', color: '#fff', fontWeight: 700, padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}>
              Сохранить
            </button>
          </div>
        </div>
      )}

      {!editing && (
        <div className={styles.actions}>
          <button
            type="button"
            onClick={onLike}
            className={effectivePost.is_liked ? styles.likeActive : undefined}
            disabled={!isAuth || toggling}
            title={isAuth ? '' : 'Только для авторизованных'}
          >
            ❤ {effectivePost.likes_count}
          </button>
          <Link to={`/posts/${post.id}`} style={{ textDecoration: 'none' }}>
            Комментарии ({effectivePost.comments_count})
          </Link>
        </div>
      )}
    </div>
  );
};

export default PostCard;
