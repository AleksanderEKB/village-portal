// front/src/features/auth/ui/Auth/PasswordSection.tsx
import React, { useState } from 'react';
import passwdStyles from './passwd.module.scss';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

type Mode = 'login' | 'register';

type PasswordStrength = 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';

type PasswordHint = { id: string; ok: boolean; label: string };

type PasswordCheck = {
  score: number;
  strength: PasswordStrength;
  error: string | null;
  hints: PasswordHint[];
};

const strengthText: Record<PasswordStrength, string> = {
  'very-weak': 'Очень слабый',
  weak: 'Слабый',
  medium: 'Средний',
  strong: 'Сильный',
  'very-strong': 'Очень сильный',
};

const scoreToPercent = (score: number) => Math.round((score / 4) * 100);

type Props = {
  mode: Mode;
  password: string;
  confirmPassword: string;
  touchedPassword: boolean;
  touchedConfirm: boolean;
  errorPassword: string | null;
  errorConfirm: string | null;
  passwordCheck: PasswordCheck;
  onOpenHint: () => void;
  onOpenForgot: () => void;
  onChangePassword: (value: string) => void;
  onBlurPassword: () => void;
  onChangeConfirm: (value: string) => void;
  onBlurConfirm: () => void;
};

const PasswordSection: React.FC<Props> = ({
  mode,
  password,
  confirmPassword,
  touchedPassword,
  touchedConfirm,
  errorPassword,
  errorConfirm,
  passwordCheck,
  onOpenHint,
  onOpenForgot,
  onChangePassword,
  onBlurPassword,
  onChangeConfirm,
  onBlurConfirm,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      {/* Поле Пароль */}
      <div className={passwdStyles.field}>
        <div className={passwdStyles.labelWithAction}>
          <label htmlFor="password">Пароль</label>
          {mode === 'register' ? (
            <button
              type="button"
              className={passwdStyles.linkLike}
              onClick={onOpenHint}
              aria-haspopup="dialog"
              aria-controls="password-hints-dialog"
            >
              Подсказка
            </button>
          ) : (
            <button type="button" className={passwdStyles.linkLike} onClick={onOpenForgot}>
              Забыли пароль?
            </button>
          )}
        </div>

        <div className={passwdStyles.passwordField}>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onChangePassword(e.target.value)}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className={`${passwdStyles.input} ${
              mode === 'register' && touchedPassword
                ? errorPassword || passwordCheck.error
                  ? passwdStyles.inputError
                  : passwdStyles.inputValid
                : ''
            }`}
            onBlur={onBlurPassword}
            aria-invalid={!!(mode === 'register' && (errorPassword || passwordCheck.error))}
            aria-describedby={
              mode === 'register' ? (errorPassword || passwordCheck.error ? 'password-error' : undefined) : undefined
            }
          />
          <button
            type="button"
            className={passwdStyles.eyeIcon}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label="Показать/скрыть пароль"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {mode === 'register' && (
          <div className={passwdStyles.pwdStrength}>
            <div className={passwdStyles.pwdStrengthBar}>
              <div
                className={passwdStyles.pwdStrengthBarFill}
                style={{ width: `${scoreToPercent(passwordCheck.score)}%` }}
                aria-hidden
              />
            </div>
            <div className={passwdStyles.pwdStrengthLabel}>
              Сила пароля: {strengthText[passwordCheck.strength]}
            </div>
          </div>
        )}

        {mode === 'register' && (errorPassword || passwordCheck.error) && (
          <div id="password-error" className={passwdStyles.fieldError}>
            {errorPassword || passwordCheck.error}
          </div>
        )}
      </div>

      {/* Поле Подтверждение */}
      {mode === 'register' && (
        <div className={passwdStyles.field}>
          <label htmlFor="confirmPassword">Повторите пароль</label>
          <div className={passwdStyles.passwordField}>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => onChangeConfirm(e.target.value)}
              required
              autoComplete="new-password"
              className={`${passwdStyles.input} ${
                touchedConfirm ? (errorConfirm ? passwdStyles.inputError : passwdStyles.inputValid) : ''
              }`}
              onBlur={onBlurConfirm}
              aria-invalid={!!(touchedConfirm && errorConfirm)}
              aria-describedby={touchedConfirm && errorConfirm ? 'confirm-error' : undefined}
            />
            <button
              type="button"
              className={passwdStyles.eyeIcon}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label="Показать/скрыть подтверждение пароля"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {touchedConfirm && errorConfirm && (
            <div id="confirm-error" className={passwdStyles.fieldError}>
              {errorConfirm}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PasswordSection;
