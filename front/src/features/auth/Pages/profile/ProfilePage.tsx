import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../app/hook';
import { selectUser } from '../../model/selectors';
import { logout, updateProfileThunk, changePasswordThunk } from '../../model/authSlice';
import type { IUser } from '../../model/types';
import styles from './profile.module.scss';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import PasswordHintsModal from '../../../auth/ui/Modals/PasswordHintsModal';
import { validatePassword } from '../../../auth/utils/validatePassword';
import AvatarPreview from '../../ui/Avatar/AvatarPreview';

// Локальные утилиты для отображения силы пароля
const strengthText = {
  'very-weak': 'Очень слабый',
  weak: 'Слабый',
  medium: 'Средний',
  strong: 'Сильный',
  'very-strong': 'Очень сильный',
};
const scoreToPercent = (score: number) => Math.round((score / 4) * 100);

// Путь дефолтной аватарки (как в форме регистрации)
const DEFAULT_AVATAR_URL = '/media/avatars/default_avatar.jpeg';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');

  // Файл, выбранный прямо сейчас (для мгновенной отрисовки превью)
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  // Текущий URL аватара пользователя (из стора или дефолт)
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>(DEFAULT_AVATAR_URL);
  // Явный флаг — есть ли у пользователя кастомный аватар (а не дефолт)
  const [hasCustomAvatar, setHasCustomAvatar] = useState<boolean>(false);

  // Скрытый input для загрузки аватара
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Инициализация из стора
  useEffect(() => {
    if (!user) return;
    setFirstName(user.first_name ?? '');
    setLastName(user.last_name ?? '');

    const hasCustom = !!user.avatar; // ключевой флаг
    setHasCustomAvatar(hasCustom);
    setCurrentAvatarUrl(hasCustom ? (user.avatar as string) : DEFAULT_AVATAR_URL);
    setPendingAvatarFile(null);
  }, [user]);

  if (!user) {
    return <div className={styles.formWrap}>Нет данных пользователя</div>;
  }
  const safeUser: IUser = user;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    await dispatch(
      updateProfileThunk({
        userId: safeUser.id,
        payload: {
          first_name: firstName,
          last_name: lastName,
          // аватар управляется отдельно
        },
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

  // === ЛОГИКА АВАТАРА ===

  // Открыть выбор файла
  const triggerAvatarFilePick = () => {
    fileInputRef.current?.click();
  };

  // Пользователь выбрал файл — показываем превью и отправляем PATCH
  const onAvatarFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    // Оптимистичное обновление
    setPendingAvatarFile(file);
    setHasCustomAvatar(true);

    try {
      await dispatch(
        updateProfileThunk({
          userId: safeUser.id,
          payload: { avatar: file },
        })
      ).unwrap();
      // Стор обновится и useEffect подтянет user.avatar; после этого pendingAvatarFile сбросится
    } catch {
      // Откат при ошибке
      setPendingAvatarFile(null);
      setHasCustomAvatar(!!safeUser.avatar);
      setCurrentAvatarUrl(!!safeUser.avatar ? (safeUser.avatar as string) : DEFAULT_AVATAR_URL);
    } finally {
      // очистим input, чтобы можно было выбрать тот же файл повторно
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Удалить аватар — сброс на дефолт (avatar: null)
  const onRemoveAvatar = async () => {
    // Оптимистично переключаем в дефолт
    const prevHasCustom = hasCustomAvatar;
    const prevUrl = currentAvatarUrl;

    setPendingAvatarFile(null);
    setHasCustomAvatar(false);
    setCurrentAvatarUrl(DEFAULT_AVATAR_URL);

    try {
      await dispatch(
        updateProfileThunk({
          userId: safeUser.id,
          payload: { avatar: null },
        })
      ).unwrap();
    } catch {
      // В случае ошибки откатим визуально
      setHasCustomAvatar(prevHasCustom);
      setCurrentAvatarUrl(prevUrl);
    }
  };

  // Только для возможной локальной логики/стилей
  const isDefaultNow = useMemo(() => !pendingAvatarFile && !hasCustomAvatar, [pendingAvatarFile, hasCustomAvatar]);

  return (
    <div className={styles.formWrap}>
      <h1 className={styles.title}>Личный кабинет</h1>

      {/* Аватар — СРАЗУ под заголовком */}
      <div className={styles.avatarBlock} style={{ margin: '12px 0 24px' }}>
        <AvatarPreview
          file={pendingAvatarFile}
          currentUrl={currentAvatarUrl}
          hasCustom={hasCustomAvatar}
          defaultUrl={DEFAULT_AVATAR_URL}
          onChangeRequest={triggerAvatarFilePick}
          onRemove={onRemoveAvatar}
          label={undefined}
        />
        {/* Скрытый input для выбора файла */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onAvatarFilePicked}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div><b>Имя:</b> {safeUser.first_name}</div>
        <div><b>Фамилия:</b> {safeUser.last_name}</div>
        <div><b>Телефон:</b> {safeUser.phone_number ?? <span style={{ color: '#aaa' }}>не указан</span>}</div>
        <div><b>Email:</b> {safeUser.email}</div>
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
