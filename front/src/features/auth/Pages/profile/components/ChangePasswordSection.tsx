// front/src/features/auth/Pages/profile/components/ChangePasswordSection.tsx
import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../app/hook';
import { selectUser } from '../../../model/selectors';
import { changePasswordThunk } from '../../../model/authSlice';
import styles from '../profile.module.scss';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import PasswordHintsModal from '../../../ui/Modals/PasswordHintsModal';
import { validatePassword } from '../../../utils/validatePassword';

const strengthText = {
  'very-weak': 'Очень слабый',
  weak: 'Слабый',
  medium: 'Средний',
  strong: 'Сильный',
  'very-strong': 'Очень сильный',
};
const scoreToPercent = (score: number) => Math.round((score / 4) * 100);

type Props = {
  visible?: boolean;
  onClose?: () => void;
};

const ChangePasswordSection: React.FC<Props> = ({ visible = true, onClose }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [newPassword2, setNewPassword2] = React.useState('');
  const [pwSubmitting, setPwSubmitting] = React.useState(false);
  const [pwError, setPwError] = React.useState<string | null>(null);

  const [showOldPw, setShowOldPw] = React.useState(false);
  const [showNewPw, setShowNewPw] = React.useState(false);
  const [showNewPw2, setShowNewPw2] = React.useState(false);

  const [pwHintOpen, setPwHintOpen] = React.useState(false);

  React.useEffect(() => {
    // сбросить поля при открытии/закрытии
    if (!visible) {
      setOldPassword('');
      setNewPassword('');
      setNewPassword2('');
      setPwError(null);
      setPwSubmitting(false);
      setShowOldPw(false);
      setShowNewPw(false);
      setShowNewPw2(false);
      setPwHintOpen(false);
    }
  }, [visible]);

  if (!visible) return null;

  const passwordCheck = validatePassword(newPassword, {
    userInputs: {
      email: user?.email,
      firstName: user?.first_name,
      lastName: user?.last_name,
    },
  });

  const confirmError = useMemo(() => {
    if (!newPassword2) return null;
    if (newPassword !== newPassword2) return 'Пароли не совпадают';
    return null;
  }, [newPassword, newPassword2]);

  const isChangePwDisabled = !!(passwordCheck.error || confirmError || !oldPassword || pwSubmitting);

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);

    if (passwordCheck.error) {
      setPwError(passwordCheck.error);
      return;
    }
    if (newPassword !== newPassword2) {
      setPwError('Пароли не совпадают');
      return;
    }
    if (oldPassword && oldPassword === newPassword) {
      setPwError('Новый пароль не должен совпадать с текущим');
      return;
    }

    try {
      setPwSubmitting(true);
      await dispatch(
        changePasswordThunk({ old_password: oldPassword, new_password: newPassword })
      ).unwrap();
      setOldPassword(''); setNewPassword(''); setNewPassword2('');
      onClose?.();
    } catch {
      if (!pwError) setPwError('Не удалось сменить пароль');
    } finally {
      setPwSubmitting(false);
    }
  }

  return (
    <div className={styles.pwBlock}>
      <form className={styles.pwForm} onSubmit={onChangePassword} noValidate>
        <div className={styles.field}>
          <label htmlFor="oldpw">Текущий пароль</label>
          <div className={styles.passwordField}>
            <input
              id="oldpw"
              type={showOldPw ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
              className={styles.input}
            />
            <button
              type="button"
              className={styles.eyeIcon}
              onClick={() => setShowOldPw((v) => !v)}
              aria-label="Показать/скрыть текущий пароль"
            >
              {showOldPw ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.labelWithAction}>
            <label htmlFor="newpw">Новый пароль</label>
            <button
              type="button"
              className={styles.linkLike}
              onClick={() => setPwHintOpen(true)}
              aria-haspopup="dialog"
              aria-controls="password-hints-dialog"
              tabIndex={0}
              style={{ marginLeft: 8, fontSize: 13 }}
            >
              Подсказка
            </button>
          </div>

          <div className={styles.passwordField}>
            <input
              id="newpw"
              type={showNewPw ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className={`${styles.input} ${
                newPassword
                  ? passwordCheck.error
                    ? styles.inputError
                    : styles.inputValid
                  : ''
              }`}
              aria-invalid={!!passwordCheck.error}
              aria-describedby={passwordCheck.error ? 'newpw-error' : undefined}
            />
            <button
              type="button"
              className={styles.eyeIcon}
              onClick={() => setShowNewPw((v) => !v)}
              aria-label="Показать/скрыть новый пароль"
            >
              {showNewPw ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

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

          {passwordCheck.error && (
            <div id="newpw-error" className={styles.fieldError}>
              {passwordCheck.error}
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="newpw2">Повторите новый пароль</label>
          <div className={styles.passwordField}>
            <input
              id="newpw2"
              type={showNewPw2 ? 'text' : 'password'}
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              autoComplete="new-password"
              className={`${styles.input} ${
                newPassword2
                  ? (newPassword !== newPassword2)
                    ? styles.inputError
                    : styles.inputValid
                  : ''
              }`}
              aria-invalid={newPassword2 ? newPassword !== newPassword2 : false}
              aria-describedby={newPassword2 && newPassword !== newPassword2 ? 'newpw2-error' : undefined}
            />
            <button
              type="button"
              className={styles.eyeIcon}
              onClick={() => setShowNewPw2((v) => !v)}
              aria-label="Показать/скрыть подтверждение нового пароля"
            >
              {showNewPw2 ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {newPassword2 && newPassword !== newPassword2 && (
            <div id="newpw2-error" className={styles.fieldError}>
              Пароли не совпадают
            </div>
          )}
        </div>

        {pwError && <div className={styles.fieldError}>{pwError}</div>}

        <div className={styles.actions}>
          <button type="submit" disabled={isChangePwDisabled}>
            {pwSubmitting ? 'Сохранение...' : 'Сменить пароль'}
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => onClose?.()}
            disabled={pwSubmitting}
          >
            Отмена
          </button>
        </div>

        <PasswordHintsModal
          open={pwHintOpen}
          onClose={() => setPwHintOpen(false)}
          passwordCheck={passwordCheck}
        />
      </form>
    </div>
  );
};

export default ChangePasswordSection;
