// front/src/features/posts/ui/detail/CommentsBlock.tsx
import React from 'react';
import styles from '../posts.module.scss';
import { CommentList, CommentForm } from '../CommentList';
import type { Comment } from '../../model/types';

type Props = {
  comments: Comment[];
  isAuth: boolean;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
};

export const CommentsBlock: React.FC<Props> = ({
  comments,
  isAuth,
  value,
  onChange,
  onSubmit,
  disabled
}) => {
  return (
    <div className={styles.detailComments}>
      {comments.length === 0 ? (
        <div className={styles.noComments}>Оставьте свой первый комментарий</div>
      ) : (
        <CommentList comments={comments} />
      )}

      {isAuth ? (
        <div className={styles.detailCommentForm}>
          <CommentForm
            value={value}
            onChange={onChange}
            onSubmit={onSubmit}
            disabled={disabled}
          />
        </div>
      ) : (
        <div style={{ color: '#999' }}>Войдите, чтобы комментировать</div>
      )}
    </div>
  );
};
