// front/src/features/posts/ui/CommentList.tsx
import React from 'react';
import type { Comment } from '../model/types';
import styles from './posts.module.scss';

const DEFAULT_AVATAR = '/media/default/default_avatar.jpeg';

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('ru-RU');
}

type ListProps = {
  comments: Comment[];
};

export const CommentList: React.FC<ListProps> = ({ comments }) => {
  return (
    <div className={styles.commentList}>
      {comments.map((c) => (
        <div key={c.id} className={styles.commentItem}>
          <img
            src={c.author.avatar || DEFAULT_AVATAR}
            alt=""
            className={styles.avatar}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              {`${c.author.first_name} ${c.author.last_name}`.trim() || c.author.email}
            </div>
            <div className={styles.commentText}>
              {c.content}
              <div className={styles.dateTime}>
                {formatTime(c.created)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

type FormProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export const CommentForm: React.FC<FormProps> = ({ value, onChange, onSubmit, disabled }) => {
  return (
    <div className={styles.addComment}>
      <input
        type="text"
        value={value}
        placeholder="Напишите комментарий…"
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      <button type="button" onClick={onSubmit} disabled={disabled}>
        Отправить
      </button>
    </div>
  );
};
