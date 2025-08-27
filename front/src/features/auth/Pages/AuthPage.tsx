// front/src/features/auth/Pages/AuthPage.tsx
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAuthError, selectAuthLoading } from '../model/selectors';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './auth.module.scss';

import { useAuthForm } from '../hooks/useAuthForm';
import { getInitialMode } from '../utils/getInitialMode';
import { useAuthSubmit } from '../hooks/useAuthSubmit';
import AvatarPreview from '../ui/Avatar/AvatarPreview';
import Modal from '../ui/Clue/Modal';

const strengthText: Record<'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong', string> = {
  'very-weak': 'Очень слабый',
  weak: 'Слабый',
  medium: 'Средний',
  strong: 'Сильный',
  'very-strong': 'Очень сильный',
};

const scoreToPercent = (score: number) => Math.round((score / 4) * 100);

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
    passwordCheck,
  } = useAuthForm(initialMode);

  const submitAuth = useAuthSubmit();

  const [isHintOpen, setHintOpen] = useState(false);

  const switchTo = (m: 'login' | 'register') => {
    setMode(m);
    navigate(m === 'login' ? '/login' : '/register', { replace: true });
    setLocalError(null);
  };

  const onSubmit = (e: React.FormEvent) => {
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
              touched.email ? (errors.email ? styles.inputError : styles.inputValid) : ''
            }`}
            onBlur={() => handleFieldChange('email', fields.email)}
            aria-invalid={!!(touched.email && errors.email)}
            aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
          />
          {touched.email && errors.email && (
            <div id="email-error" className={styles.fieldError}>
              {errors.email}
            </div>
          )}
        </div>

        {mode === 'register' && (
          <>
            <div className={styles.field}>
              <label htmlFor="firstName">Имя</label>
              <input
                id="firstName"
                value={fields.first_name}
                onChange={(e) => handleFieldChange('first_name', e.target.value)}
                required
                autoComplete="given-name"
                className={`${styles.input} ${
                  touched.first_name ? (errors.first_name ? styles.inputError : styles.inputValid) : ''
                }`}
                onBlur={() => handleFieldChange('first_name', fields.first_name)}
                aria-invalid={!!(touched.first_name && errors.first_name)}
                aria-describedby={touched.first_name && errors.first_name ? 'firstName-error' : undefined}
              />
              {touched.first_name && errors.first_name && (
                <div id="firstName-error" className={styles.fieldError}>
                  {errors.first_name}
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="lastName">Фамилия</label>
              <input
                id="lastName"
                value={fields.last_name}
                onChange={(e) => handleFieldChange('last_name', e.target.value)}
                required
                autoComplete="family-name"
                className={`${styles.input} ${
                  touched.last_name ? (errors.last_name ? styles.inputError : styles.inputValid) : ''
                }`}
                onBlur={() => handleFieldChange('last_name', fields.last_name)}
                aria-invalid={!!(touched.last_name && errors.last_name)}
                aria-describedby={touched.last_name && errors.last_name ? 'lastName-error' : undefined}
              />
              {touched.last_name && errors.last_name && (
                <div id="lastName-error" className={styles.fieldError}>
                  {errors.last_name}
                </div>
              )}
            </div>
          </>
        )}

        <div className={styles.field}>
          <div className={styles.labelWithAction}>
            <label htmlFor="password">Пароль</label>
            {mode === 'register' && (
              <button
                type="button"
                className={styles.linkLike}
                onClick={() => setHintOpen(true)}
                aria-haspopup="dialog"
                aria-controls="password-hints-dialog"
              >
                Подсказка
              </button>
            )}
          </div>

          <input
            id="password"
            type="password"
            value={fields.password}
            onChange={(e) => handleFieldChange('password', e.target.value)}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className={`${styles.input} ${
              mode === 'register' && touched.password
                ? (errors.password || passwordCheck.error)
                  ? styles.inputError
                  : styles.inputValid
                : ''
            }`}
            onBlur={() => handleFieldChange('password', fields.password)}
            aria-invalid={!!(mode === 'register' && (errors.password || passwordCheck.error))}
            aria-describedby={
              mode === 'register'
                ? (errors.password || passwordCheck.error ? 'password-error' : undefined)
                : undefined
            }
          />

          {/* Индикатор силы (оставляем видимым, а чек-лист убираем в модалку) */}
          {mode === 'register' && (
            <div className={styles.pwdStrength}>
              <div className={styles.pwdStrengthBar}>
                <div
                  className={styles.pwdStrengthBarFill}
                  style={{ width: `${scoreToPercent(passwordCheck.score)}%` }}
                  aria-hidden
                />
              </div>
              <div className={styles.pwdStrengthLabel}>
                Сила пароля: {strengthText[passwordCheck.strength]}
              </div>
            </div>
          )}

          {(mode === 'register' && (errors.password || passwordCheck.error)) && (
            <div id="password-error" className={styles.fieldError}>
              {errors.password || passwordCheck.error}
            </div>
          )}
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
                className={`${styles.input} ${
                  touched.confirmPassword ? (errors.confirmPassword ? styles.inputError : styles.inputValid) : ''
                }`}
                onBlur={() => handleFieldChange('confirmPassword', fields.confirmPassword)}
                aria-invalid={!!(touched.confirmPassword && errors.confirmPassword)}
                aria-describedby={touched.confirmPassword && errors.confirmPassword ? 'confirm-error' : undefined}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <div id="confirm-error" className={styles.fieldError}>
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="avatar">Аватар (опционально)</label>
              <AvatarPreview file={fields.avatar} onRemove={handleRemoveAvatar} />
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={(e) => handleFieldChange('avatar', e.target.files?.[0] ?? null)}
                aria-invalid={!!errors.avatar}
                aria-describedby={errors.avatar ? 'avatar-error' : undefined}
              />
              {errors.avatar && (
                <div id="avatar-error" className={styles.fieldError}>
                  {errors.avatar}
                </div>
              )}
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

      {/* Модалка с подсказками */}
      <Modal
        open={isHintOpen}
        onClose={() => setHintOpen(false)}
        title="Требования к паролю"
      >
        <div id="password-hints-dialog">
          <p>Рекомендуем придерживаться следующих правил безопасности:</p>
          <ul className="hintsList">
            {/* Показываем статический список (как просили), но можем подсветить выполненные */}
            {passwordCheck.hints.map((h) => (
              <li key={h.id} className={`hintItem ${h.ok ? 'hintOk' : 'hintBad'}`}>
                <span className="bullet" aria-hidden />
                <span>{h.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default AuthPage;
