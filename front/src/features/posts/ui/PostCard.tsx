// front/src/features/posts/ui/PostCard.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Post } from '../model/types';
import { useAppDispatch, useAppSelector } from '../../../app/hook';
import { toggleLikeThunk, updatePostThunk, deletePostThunk } from '../model/slice';
import { selectIsAuth } from '../../auth/model/selectors';
import DropMenu from '../../shared/components/dropmenu/DropdownMenu';
import { FaEllipsis } from 'react-icons/fa6';

import { DEFAULT_AVATAR } from '../model/constants';
import { formatTime } from '../lib/time';
import { truncateSmart } from '../lib/text';
import { useDropdownMenu } from '../model/hooks/useDropdownMenu';
import { usePostEditing } from '../model/hooks/usePostEditing';

import styles from './postCard.module.scss';

type Props = {
  post: Post;
};

const PostCard: React.FC<Props> = ({ post }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuth = useAppSelector(selectIsAuth);

  const effectivePost = useAppSelector((s) => s.posts.byId[post.id] ?? post);
  const toggling = useAppSelector((s) => s.posts.togglingLike[post.id] || false);

  const meId = useAppSelector((s: any) => s?.auth?.user?.id);
  const isOwner = isAuth && meId && meId === post.author.id;

  const { menuOpen, setMenuOpen, wrapperRef } = useDropdownMenu();

  const { editing, draft, setDraft, startEdit, cancelEdit, saveEdit } = usePostEditing({
    initialContent: effectivePost.content,
    onSave: async (content: string) => {
      await dispatch(updatePostThunk({ id: post.id, content })).unwrap();
    },
  });

  const onLike = () => {
    if (!isAuth || toggling) return;
    dispatch(toggleLikeThunk({ id: post.id }));
  };

  const authorName =
    `${post.author.first_name} ${post.author.last_name}`.trim() || post.author.email;

  const onEditClick = () => {
    setMenuOpen(false);
    startEdit();
  };

  const onDeleteClick = async () => {
    setMenuOpen(false);
    if (!window.confirm('Удалить пост без возможности восстановления?')) return;
    await dispatch(deletePostThunk({ id: post.id })).unwrap();
    navigate('/posts');
  };

  const onSaveEdit = async () => {
    await saveEdit();
  };

  const onCancelEdit = () => {
    cancelEdit();
  };

  const contentToRender = React.useMemo(() => {
    if (!effectivePost.content) return '';
    if (effectivePost.short_content) return effectivePost.short_content;
    return truncateSmart(effectivePost.content, 100);
  }, [effectivePost.content, effectivePost.short_content]);

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
            <div className={styles.authorName}>
              {authorName}
            </div>
            <div className={styles.meta}>{formatTime(post.created)}</div>
          </div>
        </div>

        {isOwner && (
          <div className={styles.menuWrapper} ref={wrapperRef}>
            <button
              type="button"
              className={styles.actionBtn}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              title="Действия"
            >
              <FaEllipsis />
            </button>
            <DropMenu
              open={menuOpen}
              className={styles.dropMenuRight}
            >
              <div className={styles.dropdownMenuGroup}>
                <button
                  type="button"
                  className={styles.dropdownBtn}
                  onClick={onEditClick}
                >
                  ✏️ Редактировать
                </button>
                <button
                  type="button"
                  className={`${styles.dropdownBtn} ${styles.dropdownBtnDanger}`}
                  onClick={onDeleteClick}
                >
                  🗑 Удалить
                </button>
              </div>
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
                className={styles.imageFeed}
              />
            )}
          </Link>
          {contentToRender && <div className={styles.content}>{contentToRender}</div>}
        </>
      ) : (
        <div className={styles.editGrid}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={`${styles.content} ${styles.editTextarea}`}
            placeholder="Текст поста"
          />
          <div className={styles.editActions}>
            <button type="button" onClick={onCancelEdit} className={styles.btnCancel}>
              Отмена
            </button>
            <button type="button" onClick={onSaveEdit} className={styles.btnSave}>
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
          <Link to={`/posts/${post.id}`} className={styles.commentsLink}>
            Комментарии ({effectivePost.comments_count})
          </Link>
        </div>
      )}
    </div>
  );
};

export default PostCard;
