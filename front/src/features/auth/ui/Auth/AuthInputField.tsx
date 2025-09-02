// front/src/features/auth/ui/Auth/AuthInputField.tsx
import React from 'react';
import styles from '../../Pages/auth.module.scss';

type InputMode = React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
type InputType = React.InputHTMLAttributes<HTMLInputElement>['type'];
type AutoComplete = React.InputHTMLAttributes<HTMLInputElement>['autoComplete'];

interface AuthInputFieldProps {
  id: string;
  type: InputType;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  touched?: boolean;                     // ✅ делаем необязательным
  error?: string | null;                 // допускаем null
  required?: boolean;
  inputMode?: InputMode;
  autoComplete?: AutoComplete;
}

const AuthInputField: React.FC<AuthInputFieldProps> = ({
  id,
  type,
  label,
  value,
  onChange,
  onBlur,
  touched,
  error,
  required = false,
  inputMode,
  autoComplete,
}) => {
  const isTouched = !!touched;           // ✅ приводим к boolean
  const hasError = Boolean(isTouched && error);

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className={`${styles.input} ${isTouched ? (hasError ? styles.inputError : styles.inputValid) : ''}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
      />
      {hasError && (
        <div id={`${id}-error`} className={styles.fieldError}>
          {error}
        </div>
      )}
    </div>
  );
};

export default AuthInputField;
