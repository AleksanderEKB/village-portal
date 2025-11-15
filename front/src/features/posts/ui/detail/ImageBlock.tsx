// front/src/features/posts/ui/detail/ImageBlock.tsx
import React from 'react';
import styles from '../posts.module.scss';

type Props = {
  image?: string | null;
  onOpen: () => void;
};

export const ImageBlock: React.FC<Props> = ({ image, onOpen }) => {
  return (
    <div className={styles.detailImageWrapper}>
      {image ? (
        <img
          src={image}
          alt="Post"
          className={styles.detailImage}
          onClick={onOpen}
        />
      ) : (
        <div className={styles.noImageStub}>Изображение отсутствует</div>
      )}
    </div>
  );
};
