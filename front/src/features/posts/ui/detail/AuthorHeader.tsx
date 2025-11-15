// front/src/features/posts/ui/detail/AuthorHeader.tsx
import React from 'react';
import styles from './authorHeader.module.scss';
import { formatRelativeTime } from '../../lib/time';
import type { AuthorShort } from '../../model/types';

const DEFAULT_AVATAR = '/media/default/default_avatar.jpeg';

type Props = {
  author: AuthorShort;
  created: string;
};

export const AuthorHeader: React.FC<Props> = ({ author, created }) => {
  const authorName = `${author.first_name} ${author.last_name}`.trim() || author.email;

  return (
    <div className={styles.detailHeader}>
      <div className={styles.headerLeft}>
        <img
          src={author.avatar || DEFAULT_AVATAR}
          alt="Author"
          className={styles.avatar}
        />
        <div>
          <div className={styles.authorName}>
            {authorName}
          </div>
          <div className={styles.meta}>{formatRelativeTime(created)}</div>
        </div>
      </div>
    </div>
  );
};
