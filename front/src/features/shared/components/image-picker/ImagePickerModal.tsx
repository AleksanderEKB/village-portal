// front/src/shared/components/image-picker/ImagePickerModal.tsx
import React from 'react';
import styles from './imagePicker.module.scss';
import { validateImageFile } from '../../utils/validateFile';

type Props = {
  open: boolean;
  onClose: () => void;
  initialFile: File | null;
  onConfirm: (file: File | null) => void;
  onError?: (msg: string) => void;
  defaultImageUrl?: string;
};

const ImagePickerModal: React.FC<Props> = ({
  open,
  onClose,
  initialFile,
  onConfirm,
  onError,
  defaultImageUrl = '/media/default/post_default.jpeg',
}) => {
  const [localFile, setLocalFile] = React.useState<File | null>(initialFile);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setLocalFile(initialFile);
  }, [open, initialFile]);

  React.useEffect(() => {
    let url: string | null = null;
    if (localFile) {
      url = URL.createObjectURL(localFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [localFile]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const onPickClick = () => inputRef.current?.click();

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!validateImageFile(file, (msg) => onError?.(msg))) {
      e.currentTarget.value = '';
      setLocalFile(null);
      return;
    }
    setLocalFile(file);
  };

  const onConfirmClick = () => {
    onConfirm(localFile);
    onClose();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>Выбор изображения</div>
          <button type="button" className={styles.closeBtn} aria-label="Закрыть" onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.defaultImageBox}>
            <img
              src={localFile ? (previewUrl ?? '') : defaultImageUrl}
              alt=""
              className={styles.defaultImage}
            />
          </div>

          <div className={styles.controls}>
            <div className={styles.buttonsRow}>
              {!localFile ? (
                <button type="button" className={styles.primaryBtn} onClick={onPickClick}>
                  Выбрать изображение
                </button>
              ) : (
                <button type="button" className={styles.secondaryBtn} onClick={onPickClick}>
                  Изменить
                </button>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={onChangeFile}
            />
          </div>
        </div>

        <div className={styles.footer}>
          {!localFile ? (
            <button type="button" className={styles.primaryBtn} onClick={onClose}>
              Закрыть
            </button>
          ) : (
            <>
              <button type="button" className={styles.secondaryBtn} onClick={() => setLocalFile(null)}>
                Сбросить
              </button>
              <button type="button" className={styles.primaryBtn} onClick={onConfirmClick}>
                Готово
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePickerModal;
