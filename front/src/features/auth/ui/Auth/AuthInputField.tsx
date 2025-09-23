// front/src/features/auth/ui/Auth/AuthInputField.tsx
import React from 'react';
import fieldStyles from './authField.module.scss';

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
  placeholder?: string;
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
  placeholder,
}) => {
  const isTouched = !!touched;           // ✅ приводим к boolean
  const hasError = Boolean(isTouched && error);

  return (
    <div className={fieldStyles.field}>
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
        className={`${fieldStyles.input} ${isTouched ? (hasError ? fieldStyles.inputError : fieldStyles.inputValid) : ''}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
        placeholder={placeholder}
      />
      {hasError && (
        <div id={`${id}-error`} className={fieldStyles.fieldError}>
          {error}
        </div>
      )}
    </div>
  );
};

export default AuthInputField;
