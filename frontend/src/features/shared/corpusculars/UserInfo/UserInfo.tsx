// frontend/src/features/ads/components/AdUserInfo.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { UserWithAvatar } from '../../../../types/globalTypes';
import UserInfoStyles from './userInfo.module.scss';

interface UserInfoProps {
  user: UserWithAvatar;
}

const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  return (
    <Link to={`/profile/${user.id}`} className={UserInfoStyles.UserInfo}>
      <img
        src={user.avatar || '/media/default/avatar.webp'}
        alt={user.username}
        className={UserInfoStyles.avatar}
      />
      <span className={UserInfoStyles.userName}>{user.username}</span>
    </Link>
  );
};

export default UserInfo;
