// front/src/features/auth/Pages/ResetPasswordPage.tsx
import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from '../ui/Password/passwd.module.scss';
import { apiConfirmPasswordReset } from '../api/api';
import { toast } from 'react-toastify';
import { validatePassword, PasswordStrength } from '../utils/validatePassword';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import PasswordHintsModal from '../ui/Modals/PasswordHintsModal';

const strengthText: Record<PasswordStrength, string> = {
  'very-weak': 'Очень слабый',
  weak: 'Слабый',
  medium: 'Средний',
  strong: 'Сильный',
  'very-strong': 'Очень сильный',
};

const scoreToPercent = (score: number) => Math.round((score / 4) * 100);

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  // Показ/скрытие символов
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  // Модалка с подсказками
  const [hintOpen, setHintOpen] = useState(false);

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
        {/* Поле Новый пароль */}
        <div className={styles.field}>
          <div className={styles.labelWithAction}>
            <label htmlFor="newPassword">Новый пароль</label>
            <button
              type="button"
              className={styles.linkLike}
              onClick={() => setHintOpen(true)}
              aria-haspopup="dialog"
              aria-controls="password-hints-dialog"
            >
              Подсказка
            </button>
          </div>

          <div className={styles.passwordField}>
            <input
              id="newPassword"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className={`${styles.input} ${pwdCheck.error ? styles.inputError : styles.inputValid}`}
              onBlur={() => void 0}
              aria-invalid={!!pwdCheck.error}
              aria-describedby={pwdCheck.error ? 'new-password-error' : undefined}
            />
            <button
              type="button"
              className={styles.eyeIcon}
              onClick={() => setShowPw((v) => !v)}
              aria-label="Показать/скрыть новый пароль"
            >
              {showPw ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Индикатор силы пароля */}
          <div className={styles.pwdStrength}>
            <div className={styles.pwdStrengthBar}>
              <div
                className={styles.pwdStrengthBarFill}
                style={{ width: `${scoreToPercent(pwdCheck.score)}%` }}
                aria-hidden
              />
            </div>
            <div className={styles.pwdStrengthLabel}>
              Сила пароля: {strengthText[pwdCheck.strength]}
            </div>
          </div>

          {pwdCheck.error && (
            <div id="new-password-error" className={styles.fieldError}>
              {pwdCheck.error}
            </div>
          )}
        </div>

        {/* Поле Подтверждение */}
        <div className={styles.field}>
          <label htmlFor="confirmPassword">Повторите пароль</label>
          <div className={styles.passwordField}>
            <input
              id="confirmPassword"
              type={showPw2 ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              className={`${styles.input} ${
                confirm ? (confirm !== password ? styles.inputError : styles.inputValid) : ''
              }`}
              onBlur={() => void 0}
              aria-invalid={!!(confirm && confirm !== password)}
              aria-describedby={confirm && confirm !== password ? 'confirm-password-error' : undefined}
            />
            <button
              type="button"
              className={styles.eyeIcon}
              onClick={() => setShowPw2((v) => !v)}
              aria-label="Показать/скрыть подтверждение пароля"
            >
              {showPw2 ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {confirm && confirm !== password && (
            <div id="confirm-password-error" className={styles.fieldError}>
              Пароли не совпадают
            </div>
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

      {/* Модалка с подсказками по паролю */}
      <PasswordHintsModal
        open={hintOpen}
        onClose={() => setHintOpen(false)}
        passwordCheck={{ hints: pwdCheck.hints }}
      />
    </div>
  );
};

export default ResetPasswordPage;
