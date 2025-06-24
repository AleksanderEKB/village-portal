import React from 'react';

interface ProfileBlockProps {
  isEditing: boolean;
  profile: any;
  formData: { username: string; email: string; avatar: File | null };
  userProfileLoading: boolean;
  userProfileError: string | null;
  setIsEditing: (v: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleProfileSubmit: (e: React.FormEvent) => void;
  handleDeleteProfile: () => void;
}

const ProfileBlock: React.FC<ProfileBlockProps> = ({
  isEditing,
  profile,
  formData,
  userProfileLoading,
  userProfileError,
  setIsEditing,
  handleInputChange,
  handleProfileSubmit,
  handleDeleteProfile,
}) => {
  return (
    <div className="profile-container">
      <h1 className="profile-header">{isEditing ? 'Редактирование профиля' : 'Мой профиль'}</h1>
      {isEditing ? (
        <form onSubmit={handleProfileSubmit} encType="multipart/form-data">
          <label>
            Имя:
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </label>
          <div className="userprofile-input-container">
            <p>Изменить изображение для аватарки</p>
            <input
              id="file-input"
              type="file"
              name="avatar"
              accept="image/*"
              onChange={handleInputChange}
              style={{ display: "none" }}
            />
            <label htmlFor="file-input" className="profile-input-label">Выбрать файл</label>
            <span className="file-chosen">
              {formData.avatar ? formData.avatar.name : 'Файл не выбран'}
            </span>
          </div>
          <button className='profile-change-btn' type="submit" disabled={userProfileLoading}>
            {userProfileLoading ? "Сохраняем..." : "Сохранить изменения"}
          </button>
          <button
            className='profile-change-btn'
            type="button"
            onClick={() => setIsEditing(false)}
            style={{ marginLeft: 10 }}
          >
            Отмена
          </button>
          <button
            type="button"
            className="delete-profile-button"
            onClick={handleDeleteProfile}
            style={{ marginLeft: 10, background: "#b90000" }}
            disabled={userProfileLoading}
          >
            Удалить свой профиль
          </button>
          {userProfileError && <div style={{color: 'red', marginTop: 10}}>{userProfileError}</div>}
        </form>
      ) : (
        <div className="profile-details">
          <img
            src={profile.avatar || '/media/avatars/default.webp'}
            alt="Аватар"
            className='avatar-img'
          />
          <h2>{profile.username}</h2>
          <p>Email: {(profile as any).email}</p>
          <button className='func-btn-1' onClick={() => setIsEditing(true)}>
            Редактировать свои данные
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileBlock;
