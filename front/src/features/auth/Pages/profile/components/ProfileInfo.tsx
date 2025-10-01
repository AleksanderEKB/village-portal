// front/src/features/auth/Pages/profile/components/ProfileInfo.tsx
import React from 'react';
import { useAppSelector } from '../../../../../app/hook';
import { selectUser } from '../../../model/selectors';
import styles from '../profile.module.scss';

const ProfileInfo: React.FC = () => {
  const user = useAppSelector(selectUser);
  if (!user) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <div><b>Имя:</b> {user.first_name}</div>
      <div><b>Фамилия:</b> {user.last_name}</div>
      <div>
        <b>Телефон:</b>{' '}
        {user.phone_number ?? <span style={{ color: '#aaa' }}>не указан</span>}
      </div>
      <div><b>Email:</b> {user.email}</div>
    </div>
  );
};

export default ProfileInfo;
