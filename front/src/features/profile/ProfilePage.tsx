import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hook';
import { selectUser } from '../auth/model/selectors';
import { logout, updateProfileThunk } from '../auth/model/authSlice';
import styles from './profile.module.scss';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  // Нельзя вызывать useState после условного return, поэтому стартуем пустыми…
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [avatar, setAvatar]       = useState<File | null>(null);

  // …и синхронизируемся, когда придёт user
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name ?? '');
      setLastName(user.last_name ?? '');
    }
  }, [user]);

  if (!user) {
    return <div className={styles.formWrap}>Нет данных пользователя</div>;
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    // Явная защита — TS теперь доволен
    if (!user) return;
    await dispatch(
      updateProfileThunk({
        userId: user.id,
        payload: { first_name: firstName, last_name: lastName, avatar },
      })
    );
  }

  function onLogout() {
    dispatch(logout());
  }

  return (
    <div className={styles.formWrap}>
      <h1 className={styles.title}>Личный кабинет</h1>
      <div style={{ marginBottom: 16 }}>
        <div><b>Email:</b> {user.email}</div>
        <div><b>Юзернейм:</b> {user.username}</div>
      </div>

      <form onSubmit={onSave}>
        <div className={styles.field}>
          <label htmlFor="fn">Имя</label>
          <input
            id="fn"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="ln">Фамилия</label>
          <input
            id="ln"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
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
    </div>
  );
};

export default ProfilePage;
