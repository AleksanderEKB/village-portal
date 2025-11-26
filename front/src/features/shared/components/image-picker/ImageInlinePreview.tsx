// front/src/shared/components/image-picker/ImageInlinePreview.tsx
import React from 'react';
import styles from './imagePicker.module.scss';

type Props = {
  file: File;
  onRemove: () => void;
};

const ImageInlinePreview: React.FC<Props> = ({ file, onRemove }) => {
  const [url, setUrl] = React.useState<string>('');

  React.useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return (
    <div className={styles.previewInline}>
      <div className={styles.previewBox}>
        <img src={url} alt="" />
        <button type="button" className={styles.removeBtn} aria-label="Удалить" onClick={onRemove}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default ImageInlinePreview;
