// front/src/features/auth/ui/Names/FieldNames.tsx
import React from 'react';
import namesStyles from './names.module.scss';

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
  placeholder?: string;
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
  placeholder,
}) => {
  const hasError = !!(touched && error);
  const describedId = hasError ? (describedById ?? `${id}-error`) : undefined;

  return (
    <div className={namesStyles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        autoComplete={autoComplete}
        className={`${namesStyles.input} ${touched ? (hasError ? namesStyles.inputError : namesStyles.inputValid) : ''}`}
        aria-invalid={hasError}
        aria-describedby={describedId}
        placeholder={placeholder}
      />
      {hasError && (
        <div id={describedId} className={namesStyles.fieldError}>
          {error}
        </div>
      )}
    </div>
  );
};

export default FieldNames;
