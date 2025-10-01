// front/src/features/auth/Pages/profile/components/DangerZone.tsx
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../app/hook';
import { selectUser } from '../../../model/selectors';
import { deleteProfileThunk } from '../../../model/authSlice';
import styles from '../profile.module.scss';

const DangerZone: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  // Жёсткий гард: ниже user точно не null
  if (!user) return null;
  const userId: string = user.id;

  async function onDeleteProfile() {
    const ok = window.confirm(
      'Удалить профиль без возможности восстановления?\nВсе ваши данные будут удалены.'
    );
    if (!ok) return;
    try {
      await dispatch(deleteProfileThunk({ userId })).unwrap();
    } catch {
      // Ошибка обработана в thunk/toast
    }
  }

  return (
    <div className={styles.dangerZone}>
      <div className={styles.dangerTitle}>Опасная зона</div>
      <button type="button" className={styles.dangerBtn} onClick={onDeleteProfile}>
        Удалить аккаунт
      </button>
    </div>
  );
};

export default DangerZone;
