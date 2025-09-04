// front/src/features/auth/handlers/useAuthHandlers.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { apiRequestPasswordReset } from '../api/api';
import type { AuthFormFields, AuthFormErrors } from '../hooks/useAuthForm';
import type { PasswordValidationResult } from '../utils/validatePassword';
import type { SubmitParams } from '../hooks/useAuthSubmit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Params = {
  mode: 'login' | 'register';
  setMode: (m: 'login' | 'register') => void;

  fields: AuthFormFields;
  errors: AuthFormErrors;
  passwordCheck: PasswordValidationResult;

  setLocalError: (err: string | null) => void;
  submitAuth: (p: SubmitParams) => Promise<void>;

  fpEmail: string;
  setFpOpen: (v: boolean) => void;
};

export function useAuthHandlers({
  mode,
  setMode,
  fields,
  errors,
  passwordCheck,
  setLocalError,
  submitAuth,
  fpEmail,
  setFpOpen,
}: Params) {
  const navigate = useNavigate();

  const switchTo = useCallback(
    (m: 'login' | 'register') => {
      setMode(m);
      navigate(m === 'login' ? '/login' : '/register', { replace: true });
      setLocalError(null);
    },
    [navigate, setMode, setLocalError],
  );

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (mode === 'register') {
        const firstError =
          errors.email ||
          errors.first_name ||
          errors.last_name ||
          errors.password ||
          errors.confirmPassword ||
          errors.avatar ||
          passwordCheck.error;

        if (firstError) {
          setLocalError(firstError);
          return;
        }
      }

      submitAuth({
        mode,
        fields,
        setLocalError,
        onSuccess: () => {
          if (mode === 'register') {
            toast.success(
              'На ваш email отправлено письмо для подтверждения. Перейдите по ссылке из письма для активации аккаунта.',
              { autoClose: 8000 },
            );
          }
          navigate('/profile');
        },
      });
    },
    [mode, errors, passwordCheck.error, submitAuth, fields, setLocalError, navigate],
  );

  const handleForgotPassword = useCallback(async () => {
    if (!fpEmail || !EMAIL_RE.test(fpEmail)) {
      toast.error('Введите корректный email');
      return;
    }
    try {
      await apiRequestPasswordReset(fpEmail);
      toast.success('Если такой email существует, мы отправили письмо со ссылкой для сброса.');
      setFpOpen(false);
    } catch {
      toast.success('Если такой email существует, мы отправили письмо со ссылкой для сброса.');
      setFpOpen(false);
    }
  }, [fpEmail, setFpOpen]);

  return { switchTo, onSubmit, handleForgotPassword };
}

export type UseAuthHandlersReturn = ReturnType<typeof useAuthHandlers>;
