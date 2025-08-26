import { useState, useCallback } from 'react';
import { validateEmail } from '../utils/validateAuthPage';

export type AuthFormFields = {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar: File | null;
};

export type AuthFormErrors = {
  email?: string; // undefined если нет ошибки!
  // для других полей аналогично
};

export function useAuthForm(initialMode: 'login' | 'register') {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const [fields, setFields] = useState<AuthFormFields>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    first_name: '',
    last_name: '',
    avatar: null,
  });

  const [localError, setLocalError] = useState<string | null>(null);

  const [touched, setTouched] = useState<{ [K in keyof AuthFormFields]?: boolean }>({});
  const [errors, setErrors] = useState<AuthFormErrors>({});

  const handleFieldChange = useCallback(
    (field: keyof AuthFormFields, value: string | File | null) => {
      setFields((prev) => ({
        ...prev,
        [field]: value,
      }));
      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }));

      // Валидация email
      if (field === 'email') {
        setErrors((prev) => ({
          ...prev,
          email: validateEmail(value as string) ?? undefined,
        }));
      }
      // Аналогично для других полей
    },
    []
  );

  const handleRemoveAvatar = () => {
    setFields((prev) => ({
      ...prev,
      avatar: null,
    }));
  };

  return {
    mode,
    setMode,
    fields,
    setFields,
    handleFieldChange,
    handleRemoveAvatar,
    localError,
    setLocalError,
    touched,
    errors,
  };
}
