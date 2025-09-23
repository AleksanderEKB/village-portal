// front/src/features/auth/ui/Avatar/AvatarField.tsx
import React from 'react';
import { toast } from 'react-toastify';
import AvatarPreview from './AvatarPreview';
import avatarStyles from './avatar.module.scss';

type Props = {
  file: File | null;
  error?: string | null;
  onChange: (file: File | null) => void;
  onRemove: () => void;
  inputId?: string;
  label?: string;
  describedById?: string;
  defaultUrl: string;
};

const AvatarField: React.FC<Props> = ({
  file,
  error,
  onChange,
  onRemove,
  inputId = 'avatar',
  label = 'Аватар',
  describedById,
  defaultUrl,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFile = (f: File | null, target?: HTMLInputElement | null) => {
    if (f && !f.type.startsWith('image/')) {
      toast.error('Файл не является изображением');
      if (target) target.value = '';
      return;
    }
    onChange(f);
  };

  return (
    <div className={avatarStyles.fieldRoot}>
      <AvatarPreview
        file={file}
        defaultUrl={defaultUrl}
        onRemove={() => {
          if (inputRef.current) inputRef.current.value = '';
          onRemove();
        }}
        onChangeRequest={() => inputRef.current?.click()}
        label={label}
      />

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className={avatarStyles.hiddenInput}
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          handleFile(f, e.currentTarget);
        }}
        aria-invalid={!!error}
        aria-describedby={describedById}
      />

      {error && (
        <div id={describedById} className={avatarStyles.errorText} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default AvatarField;
