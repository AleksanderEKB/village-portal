// frontend/src/features/ads/components/AdUserInfo.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { UserWithAvatar } from '../../../../types/globalTypes';
import adUserInfoStyles from '../../styles/adUserInfo.module.scss';

interface AdUserInfoProps {
  user: UserWithAvatar;
}

const AdUserInfo: React.FC<AdUserInfoProps> = ({ user }) => {
  return (
    <Link to={`/profile/${user.id}`} className={adUserInfoStyles.adsUserInfo}>
      <img
        src={user.avatar || '/media/default/avatar.webp'}
        alt={user.username}
        className={adUserInfoStyles.avatar}
      />
      <span className={adUserInfoStyles.userName}>{user.username}</span>
    </Link>
  );
};

export default AdUserInfo;
