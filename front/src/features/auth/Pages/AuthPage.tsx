import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectAuthError, selectAuthLoading } from '../model/selectors';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './auth.module.scss';

import { useAuthForm } from '../hooks/useAuthForm';
import { getInitialMode } from '../utils/getInitialMode';
import { useAuthSubmit } from '../hooks/useAuthSubmit';
import AvatarPreview from '../ui/Avatar/AvatarPreview';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const initialMode = useMemo(() => getInitialMode(location), [location.pathname]);
  const {
    mode,
    setMode,
    fields,
    handleFieldChange,
    handleRemoveAvatar,
    localError,
    setLocalError,
    touched,
    errors,
  } = useAuthForm(initialMode);

  const submitAuth = useAuthSubmit();

  const switchTo = (m: 'login' | 'register') => {
    setMode(m);
    navigate(m === 'login' ? '/login' : '/register', { replace: true });
    setLocalError(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAuth({
      mode,
      fields,
      setLocalError,
      onSuccess: () => navigate('/profile'),
    });
  };

  return (
    <div className={styles.formWrap}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={mode === 'login' ? styles.tabActive : styles.tab}
          onClick={() => switchTo('login')}
          aria-pressed={mode === 'login'}
        >
          Вход
        </button>
        <button
          type="button"
          className={mode === 'register' ? styles.tabActive : styles.tab}
          onClick={() => switchTo('register')}
          aria-pressed={mode === 'register'}
        >
          Регистрация
        </button>
      </div>

      <h1 className={styles.title}>{mode === 'login' ? 'Вход' : 'Регистрация'}</h1>
      {(error || localError) && <div className={styles.error}>{error || localError}</div>}

      <form onSubmit={onSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            required
            inputMode="email"
            className={`${styles.input} ${
              touched.email
                ? errors.email
                  ? styles.inputError
                  : styles.inputValid
                : ''
            }`}
            onBlur={() => handleFieldChange('email', fields.email)}
          />
          {touched.email && errors.email && (
            <div className={styles.fieldError}>{errors.email}</div>
          )}
        </div>

        {mode === 'register' && (
          <>
            <div className={styles.field}>
              <label htmlFor="username">Юзернейм</label>
              <input
                id="username"
                value={fields.username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="firstName">Имя</label>
              <input
                id="firstName"
                value={fields.first_name}
                onChange={(e) => handleFieldChange('first_name', e.target.value)}
                required
                autoComplete="given-name"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="lastName">Фамилия</label>
              <input
                id="lastName"
                value={fields.last_name}
                onChange={(e) => handleFieldChange('last_name', e.target.value)}
                required
                autoComplete="family-name"
              />
            </div>
          </>
        )}

        <div className={styles.field}>
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            value={fields.password}
            onChange={(e) => handleFieldChange('password', e.target.value)}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        {mode === 'register' && (
          <>
            <div className={styles.field}>
              <label htmlFor="confirmPassword">Повторите пароль</label>
              <input
                id="confirmPassword"
                type="password"
                value={fields.confirmPassword}
                onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="avatar">Аватар (опционально)</label>
              <AvatarPreview file={fields.avatar} onRemove={handleRemoveAvatar} />
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={(e) => handleFieldChange('avatar', e.target.files?.[0] ?? null)}
              />
            </div>
          </>
        )}

        <div className={styles.actions}>
          <button type="submit" disabled={loading}>
            {loading
              ? mode === 'login'
                ? 'Входим…'
                : 'Регистрируем…'
              : mode === 'login'
              ? 'Войти'
              : 'Создать аккаунт'}
          </button>

          <div className={styles.alt}>
            {mode === 'login' ? (
              <>
                Нет аккаунта?{' '}
                <button type="button" className={styles.linkLike} onClick={() => switchTo('register')}>
                  Зарегистрируйтесь
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <button type="button" className={styles.linkLike} onClick={() => switchTo('login')}>
                  Войдите
                </button>
              </>
            )}
          </div>
        </div>
      </form>

      <div className={styles.linksMuted}>
        <Link to="/">На главную</Link>
      </div>
    </div>
  );
};

export default AuthPage;
