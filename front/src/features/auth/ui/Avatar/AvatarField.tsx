// front/src/features/auth/ui/Avatar/AvatarField.tsx
import React from 'react';
import { toast } from 'react-toastify';
import AvatarPreview from './AvatarPreview';
import styles from '../../Pages/auth.module.scss';

type Props = {
  file: File | null;
  error?: string | null;
  onChange: (file: File | null) => void;
  onRemove: () => void;
  inputId?: string;
  label?: string;
  describedById?: string;
};

const AvatarField: React.FC<Props> = ({
  file,
  error,
  onChange,
  onRemove,
  inputId = 'avatar',
  label = 'Аватар (опционально)',
  describedById,
}) => {
  return (
    <div className={styles.field}>
      <label htmlFor={inputId}>{label}</label>

      <AvatarPreview file={file} onRemove={onRemove} />

      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (f && !f.type.startsWith('image/')) {
            toast.error('Файл не является изображением');
            e.currentTarget.value = '';
            return;
          }
          onChange(f);
        }}
        aria-invalid={!!error}
        aria-describedby={error ? (describedById ?? `${inputId}-error`) : undefined}
      />

      {error && (
        <div
          id={describedById ?? `${inputId}-error`}
          className={styles.fieldError}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default AvatarField;
