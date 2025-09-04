// front/src/features/auth/hooks/useAuthSubmit.ts
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../../app/hook';
import { loginThunk, registerThunk } from '../model/authSlice';

export type SubmitParams = {
  mode: 'login' | 'register';
  fields: {
    email: string;
    password: string;
    confirmPassword: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    avatar: File | null;
  };
  setLocalError: (err: string | null) => void;
  onSuccess: () => void;
};

// Проверка на HTML-ответ (не показывать его на форме)
function isHtmlError(msg?: string) {
  return typeof msg === 'string' && /<html|<!DOCTYPE/i.test(msg);
}

function normalizeToText(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (Array.isArray(v)) return v.join(' ');
  if (typeof v === 'object') return JSON.stringify(v);
  if (typeof v === 'string') return v;
  return String(v);
}

function parseError(action: any): { status?: number; message?: string; data?: any } {
  const payload = action?.payload;

  if (payload) {
    // Всегда пробрасываем status + "сырые" data дальше (нам нужны поля email/phone_number)
    const status = typeof payload.status === 'number' ? payload.status : undefined;
    const data = payload.data ?? payload;

    // Пытаемся достать приемлемое текстовое сообщение (fallback)
    const msg =
      data?.message ??
      data?.detail ??
      normalizeToText(data?.non_field_errors) ??
      normalizeToText(data);

    return { status, message: msg, data };
  }

  const err = action?.error;
  if (err && err.message && err.message !== 'Rejected') {
    return { message: err.message };
  }
  return {};
}

export function useAuthSubmit() {
  const dispatch = useAppDispatch();

  return useCallback(
    async (params: SubmitParams) => {
      const { mode, fields, setLocalError, onSuccess } = params;
      setLocalError(null);

      if (mode === 'login') {
        const res = await dispatch(loginThunk({ email: fields.email, password: fields.password }));
        if (loginThunk.fulfilled.match(res)) {
          onSuccess();
        } else {
          const { message } = parseError(res);
          const fallback = 'Не удалось войти. Проверьте email и пароль.';
          toast.error(message || fallback);
          setLocalError(!isHtmlError(message) ? (message || fallback) : null);
        }
        return;
      }

      // REGISTER
      if (fields.password !== fields.confirmPassword) {
        setLocalError('Пароли не совпадают');
        return;
      }

      const res = await dispatch(
        registerThunk({
          email: fields.email,
          first_name: fields.first_name,
          last_name: fields.last_name,
          phone_number: fields.phone_number,
          password: fields.password,
          avatar: fields.avatar,
        }),
      );

      if (registerThunk.fulfilled.match(res)) {
        onSuccess();
        return;
      }

      const { status, message, data } = parseError(res);

      const emailErr = normalizeToText(data?.email);
      const phoneErr = normalizeToText(data?.phone_number);

      const msgLower = (message || '').toLowerCase();
      const emailLower = (emailErr || '').toLowerCase();
      const phoneLower = (phoneErr || '').toLowerCase();

      const isDuplicateEmail =
        !!emailErr ||
        (msgLower.includes('email') &&
          (msgLower.includes('уже') || msgLower.includes('exists') || msgLower.includes('зарегистр')));

      const isDuplicatePhone =
        !!phoneErr ||
        msgLower.includes('phone') ||
        msgLower.includes('номер телефона') ||
        (msgLower.includes('телефон') &&
          (msgLower.includes('уже') || msgLower.includes('exists') || msgLower.includes('зарегистр')));

      if (isDuplicatePhone) {
        const dupMsg = 'Пользователь с таким номером телефона уже зарегистрирован';
        toast.error(dupMsg);
        setLocalError(dupMsg);
        return;
      }

      if (isDuplicateEmail || emailLower.includes('уже')) {
        const dupMsg = 'Пользователь с таким email уже зарегистрирован';
        toast.error(dupMsg);
        setLocalError(dupMsg);
        return;
      }

      if (status === 409) {
        if (msgLower.includes('email')) {
          const dupMsg = 'Пользователь с таким email уже зарегистрирован';
          toast.error(dupMsg);
          setLocalError(dupMsg);
          return;
        }
        if (msgLower.includes('phone') || msgLower.includes('номер телефона')) {
          const dupMsg = 'Пользователь с таким номером телефона уже зарегистрирован';
          toast.error(dupMsg);
          setLocalError(dupMsg);
          return;
        }
        toast.error(message || 'Запись с такими данными уже существует');
        setLocalError(!isHtmlError(message) ? (message || 'Запись с такими данными уже существует') : null);
        return;
      }

      if (status === 500 || isHtmlError(message)) {
        toast.error('Ошибка сервера при регистрации. Попробуйте позже.');
        setLocalError(null);
        return;
      }

      const fallback = 'Не удалось завершить регистрацию.';
      toast.error(message || fallback);
      setLocalError(!isHtmlError(message) ? (message || fallback) : null);
    },
    [dispatch],
  );
}
