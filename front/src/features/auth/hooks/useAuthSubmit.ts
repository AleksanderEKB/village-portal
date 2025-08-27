import { useCallback } from 'react';
import { useAppDispatch } from '../../../app/hook';
import { loginThunk, registerThunk } from '../model/authSlice';

type SubmitParams = {
  mode: 'login' | 'register';
  fields: {
    email: string;
    password: string;
    confirmPassword: string;
    // username: string;
    first_name: string;
    last_name: string;
    avatar: File | null;
  };
  setLocalError: (err: string | null) => void;
  onSuccess: () => void;
};

export function useAuthSubmit() {
  const dispatch = useAppDispatch();

  return useCallback(async (params: SubmitParams) => {
    const { mode, fields, setLocalError, onSuccess } = params;
    setLocalError(null);

    if (mode === 'login') {
      const res = await dispatch(loginThunk({ email: fields.email, password: fields.password }));
      if (loginThunk.fulfilled.match(res)) onSuccess();
      return;
    }

    if (fields.password !== fields.confirmPassword) {
      setLocalError('Пароли не совпадают');
      return;
    }

    const res = await dispatch(
      registerThunk({
        email: fields.email,
        // username: fields.username,
        first_name: fields.first_name,
        last_name: fields.last_name,
        password: fields.password,
        avatar: fields.avatar,
      })
    );
    if (registerThunk.fulfilled.match(res)) onSuccess();
  }, [dispatch]);
}
