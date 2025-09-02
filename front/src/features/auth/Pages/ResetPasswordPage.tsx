// front/src/features/auth/Pages/ResetPasswordPage.tsx
import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './auth.module.scss';
import { apiConfirmPasswordReset } from '../api/api';
import { toast } from 'react-toastify';
import { validatePassword } from '../utils/validatePassword';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const pwdCheck = useMemo(
    () =>
      validatePassword(password, {
        minLength: 10,
        forbidCommon: true,
        userInputs: {},
      }),
    [password]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Некорректная ссылка');
      return;
    }
    if (pwdCheck.error) {
      toast.error(pwdCheck.error);
      return;
    }
    if (password !== confirm) {
      toast.error('Пароли не совпадают');
      return;
    }
    try {
      setLoading(true);
      await apiConfirmPasswordReset(token, password);
      toast.success('Пароль обновлён. Войдите с новым паролем.');
      navigate('/login');
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        'Не удалось обновить пароль. Попробуйте снова.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formWrap} style={{ maxWidth: 420 }}>
      <h1 className={styles.title}>Новый пароль</h1>
      <form onSubmit={onSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="newPassword">Новый пароль</label>
          <input
            id="newPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            className={`${styles.input} ${pwdCheck.error ? styles.inputError : ''}`}
          />
          {pwdCheck.error && <div className={styles.fieldError}>{pwdCheck.error}</div>}
        </div>
        <div className={styles.field}>
          <label htmlFor="confirmPassword">Повторите пароль</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            className={`${styles.input} ${confirm && confirm !== password ? styles.inputError : ''}`}
          />
          {confirm && confirm !== password && (
            <div className={styles.fieldError}>Пароли не совпадают</div>
          )}
        </div>
        <div className={styles.actions}>
          <button type="submit" disabled={loading}>
            {loading ? 'Сохраняем…' : 'Установить пароль'}
          </button>
          <div className={styles.linksMuted}>
            <Link to="/login">На страницу входа</Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
