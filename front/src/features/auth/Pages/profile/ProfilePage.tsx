// front/src/features/auth/ui/Pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../app/hook';
import { selectUser } from '../../model/selectors';
import { logout, updateProfileThunk, changePasswordThunk } from '../../model/authSlice';
import type { IUser } from '../../model/types';
import styles from '../auth.module.scss';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import PasswordHintsModal from '../../../auth/ui/Modals/PasswordHintsModal';
import { validatePassword } from '../../../auth/utils/validatePassword';

// Локальные утилиты для отображения силы пароля
const strengthText = {
  'very-weak': 'Очень слабый',
  weak: 'Слабый',
  medium: 'Средний',
  strong: 'Сильный',
  'very-strong': 'Очень сильный',
};
const scoreToPercent = (score: number) => Math.round((score / 4) * 100);

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [avatar, setAvatar]       = useState<File | null>(null);

  const [showPwForm, setShowPwForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // Показ/скрытие символов для всех полей пароля
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showNewPw2, setShowNewPw2] = useState(false);

  // Для подсказки
  const [pwHintOpen, setPwHintOpen] = useState(false);

  // Проверка пароля для шкалы и подсказки
  const passwordCheck = validatePassword(newPassword, {
    userInputs: {
      email: user?.email,
      firstName: firstName,
      lastName: lastName,
    },
  });

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name ?? '');
      setLastName(user.last_name ?? '');
    }
  }, [user]);

  if (!user) {
    return <div className={styles.formWrap}>Нет данных пользователя</div>;
  }

  // После раннего return выше user гарантированно есть — «фиксируем» тип
  const safeUser: IUser = user;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    await dispatch(
      updateProfileThunk({
        userId: safeUser.id,
        payload: { first_name: firstName, last_name: lastName, avatar },
      })
    );
  }

  function onLogout() {
    dispatch(logout());
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);

    if (newPassword.length < 8) {
      setPwError('Новый пароль должен быть не короче 8 символов');
      return;
    }
    if (newPassword !== newPassword2) {
      setPwError('Пароли не совпадают');
      return;
    }

    try {
      setPwSubmitting(true);
      await dispatch(changePasswordThunk({ old_password: oldPassword, new_password: newPassword })).unwrap();
      setOldPassword(''); setNewPassword(''); setNewPassword2('');
      setShowPwForm(false);
    } catch {
      if (!pwError) setPwError('Не удалось сменить пароль');
    } finally {
      setPwSubmitting(false);
    }
  }

  return (
    <div className={styles.formWrap}>
      <h1 className={styles.title}>Личный кабинет</h1>
      <div style={{ marginBottom: 16 }}>
        <div><b>Email:</b> {safeUser.email}</div>
        <div><b>Юзернейм:</b> {safeUser.first_name}</div>
        <div><b>Телефон:</b> {safeUser.phone_number ?? <span style={{ color: '#aaa' }}>не указан</span>}</div>
      </div>

      <form onSubmit={onSave}>
        <div className={styles.field}>
          <label htmlFor="fn">Имя</label>
          <input id="fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>

        <div className={styles.field}>
          <label htmlFor="ln">Фамилия</label>
          <input id="ln" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        <div className={styles.field}>
          <label htmlFor="ava">Новый аватар</label>
          <input
            id="ava"
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className={styles.actions}>
          <button type="submit">Сохранить</button>
          <button type="button" onClick={onLogout}>Выйти</button>
        </div>
      </form>

      <div className={styles.pwBlock}>
        {!showPwForm ? (
          <button
            type="button"
            className={styles.pwBtn}
            onClick={() => setShowPwForm(true)}
          >
            Изменить пароль
          </button>
        ) : (
          <form className={styles.pwForm} onSubmit={onChangePassword}>
            <div className={styles.field}>
              <label htmlFor="oldpw">Текущий пароль</label>
              <div className={styles.passwordField}>
                <input
                  id="oldpw"
                  type={showOldPw ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  autoComplete="current-password"
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
                  className={styles.input}
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

              {/* Шкала силы пароля */}
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
                  className={styles.input}
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
            </div>

            {pwError && <div className={styles.fieldError}>{pwError}</div>}

            <div className={styles.actions}>
              <button type="submit" disabled={pwSubmitting}>
                {pwSubmitting ? 'Сохранение...' : 'Сменить пароль'}
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => { setShowPwForm(false); setPwError(null); }}
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
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
