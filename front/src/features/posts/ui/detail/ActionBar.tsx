// front/src/features/posts/ui/detail/ActionBar.tsx
import React from 'react';
import styles from './actionBar.module.scss';
import DropMenu from '../../../shared/components/dropmenu/DropdownMenu';
import { FaEnvelope } from "react-icons/fa6";

type Props = {
  isOwner: boolean;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;

  editing: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;

  isAuth: boolean;
  toggling: boolean;
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
};

export const ActionBar: React.FC<Props> = ({
  isOwner,
  menuOpen,
  setMenuOpen,
  editing,
  onEditClick,
  onDeleteClick,
  isAuth,
  toggling,
  isLiked,
  likesCount,
  onLike,
}) => {
  return (
    <div className={styles.actionBlock}>
      {isOwner && (
        <div className={styles.menuWrapper}>
          <button
            type="button"
            className={styles.actionBtn}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FaEnvelope />
          </button>
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
        className={`${styles.detailLikeBtn} ${isLiked ? styles.likeActive : ''}`}
      >
        <img
          src="/media/icons/heart-solid-full.svg"
          alt=""
          style={{ width: 20, height: 20, display: 'block' }}
        />
        {likesCount}
      </button>
    </div>
  );
};
