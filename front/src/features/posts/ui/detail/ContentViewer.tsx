// front/src/features/posts/ui/detail/ContentViewer.tsx
import React from 'react';
import styles from '../posts.module.scss';

type Props = {
  content?: string | null;
};

export const ContentViewer: React.FC<Props> = ({ content }) => {
  if (!content) return null;
  return (
    <div className={styles.detailContentBlock}>
      <div className={styles.content}>{content}</div>
    </div>
  );
};
