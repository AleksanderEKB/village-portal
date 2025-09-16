// front/src/features/auth/hooks/useAuthForm.ts
import { useState, useCallback, useMemo } from 'react';
import {
  validateEmail,
  validateFirstName,
  validateLastName,
} from '../utils/validateAuthPage';
import {
  validatePassword,
  type PasswordValidationResult
} from '../utils/validatePassword';
import { validateAvatar } from '../utils/validateAvatar';

export type AuthFormFields = {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  avatar: File | null;
};

export type AuthFormErrors = {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  password?: string;
  confirmPassword?: string;
  avatar?: string;
};

export function useAuthForm(initialMode: 'login' | 'register') {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const [fields, setFields] = useState<AuthFormFields>({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    avatar: null,
  });

  const [localError, setLocalError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ [K in keyof AuthFormFields]?: boolean }>({});
  const [errors, setErrors] = useState<AuthFormErrors>({});

  const passwordCheck: PasswordValidationResult = useMemo(() => {
    return validatePassword(fields.password, {
      minLength: 10,
      forbidCommon: true,
      userInputs: {
        email: fields.email,
        firstName: fields.first_name,
        lastName: fields.last_name,
        username: fields.email?.split('@')[0],
      },
    });
  }, [fields.password, fields.email, fields.first_name, fields.last_name]);

  const validateConfirm = useCallback(
    (pwd: string, confirm: string) =>
      !confirm ? 'Повторите пароль' : pwd !== confirm ? 'Пароли не совпадают' : undefined,
    []
  );

  const handleFieldChange = useCallback(
    (field: keyof AuthFormFields, value: string | File | null) => {
      setLocalError(null); // Сброс localError при любом изменении поля

      setFields((prev) => ({ ...prev, [field]: value as any }));
      setTouched((prev) => ({ ...prev, [field]: true }));

      if (field === 'email') {
        const email = value as string;
        setErrors((prev) => ({
          ...prev,
          email: validateEmail(email) ?? undefined,
          password:
            mode === 'register'
              ? validatePassword(fields.password || '', {
                  minLength: 10,
                  forbidCommon: true,
                  userInputs: {
                    email,
                    firstName: fields.first_name,
                    lastName: fields.last_name,
                    username: email?.split('@')[0],
                  },
                }).error ?? undefined
              : undefined,
        }));
      }

      if (field === 'first_name') {
        const v = value as string;
        setErrors((prev) => ({
          ...prev,
          first_name: validateFirstName(v) ?? undefined,
          password:
            mode === 'register'
              ? validatePassword(fields.password || '', {
                  minLength: 10,
                  forbidCommon: true,
                  userInputs: {
                    email: fields.email,
                    firstName: v,
                    lastName: fields.last_name,
                    username: fields.email?.split('@')[0],
                  },
                }).error ?? undefined
              : undefined,
        }));
      }

      if (field === 'last_name') {
        const v = value as string;
        setErrors((prev) => ({
          ...prev,
          last_name: validateLastName(v) ?? undefined,
          password:
            mode === 'register'
              ? validatePassword(fields.password || '', {
                  minLength: 10,
                  forbidCommon: true,
                  userInputs: {
                    email: fields.email,
                    firstName: fields.first_name,
                    lastName: v,
                    username: fields.email?.split('@')[0],
                  },
                }).error ?? undefined
              : undefined,
        }));
      }

      if (field === 'phone_number') {
        const valueStr = value as string;
        setErrors((prev) => ({
          ...prev,
          phone_number:
            mode === 'register' && valueStr && !/^\+?[0-9]{7,18}$/.test(valueStr)
              ? 'Некорректный номер'
              : undefined,
        }));
      }

      if (field === 'password') {
        const pwd = value as string;
        const pwdError =
          mode === 'register'
            ? validatePassword(pwd, {
                minLength: 10,
                forbidCommon: true,
                userInputs: {
                  email: fields.email,
                  firstName: fields.first_name,
                  lastName: fields.last_name,
                  username: fields.email?.split('@')[0],
                },
              }).error ?? undefined
            : undefined;

        setErrors((prev) => ({
          ...prev,
          password: pwdError,
          confirmPassword: mode === 'register' ? validateConfirm(pwd, fields.confirmPassword) : undefined,
        }));
      }

      if (field === 'confirmPassword') {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: mode === 'register' ? validateConfirm(fields.password, value as string) : undefined,
        }));
      }

      if (field === 'avatar') {
        const avatarError = validateAvatar(value as File | null);
        setErrors((prev) => ({
          ...prev,
          avatar: avatarError,
        }));
      }
    },
    [
      mode,
      fields.password,
      fields.confirmPassword,
      fields.first_name,
      fields.last_name,
      fields.email,
      validateConfirm,
      validateAvatar,
    ]
  );

  const handleRemoveAvatar = () => {
    setFields((prev) => ({ ...prev, avatar: null }));
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
    passwordCheck,
  };
}
