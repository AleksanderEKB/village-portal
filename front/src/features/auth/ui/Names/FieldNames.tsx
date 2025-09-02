// front/src/features/auth/ui/Names/FieldNames.tsx
import React from 'react';
import styles from '../../Pages/auth.module.scss';

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  required?: boolean;
  autoComplete?: string;
  touched?: boolean;
  error?: string | null;
  describedById?: string; // опционально, если нужно переопределить id ошибки
};

const FieldNames: React.FC<Props> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  required,
  autoComplete,
  touched,
  error,
  describedById,
}) => {
  const hasError = !!(touched && error);
  const describedId = hasError ? (describedById ?? `${id}-error`) : undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        autoComplete={autoComplete}
        className={`${styles.input} ${touched ? (hasError ? styles.inputError : styles.inputValid) : ''}`}
        aria-invalid={hasError}
        aria-describedby={describedId}
      />
      {hasError && (
        <div id={describedId} className={styles.fieldError}>
          {error}
        </div>
      )}
    </div>
  );
};

export default FieldNames;
