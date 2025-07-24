// frontend/src/features/userProfile/components/UserProfile.tsx
import React from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import ProfileBlock from './ProfileBlock';
import PostsBlock from './PostsBlock';
import AdsBlock from './AdsBlock';
import '../styles.scss';


const UserProfile: React.FC = () => {
  const {
    userProfileLoading,
    userProfileError,
    isAuthenticated,
    userAds,
    isEditing,
    setIsEditing,
    formData,
    handleInputChange,
    handleProfileSubmit,
    handleDeleteProfile,
    myPosts,
    handleDeletePostClick,
    commentTexts,
    setCommentTexts,
    showComments,
    setShowComments,
    handleDeleteAd,
  } = useUserProfile();

  const profile = useSelector((state: RootState) => state.userProfile.profile);

  if (!profile && userProfileLoading) return <p>Загрузка...</p>;
  if (!profile) return <p>Нет данных профиля</p>;

  return (
    <div className='user-profile-content'>
      <ProfileBlock
        isEditing={isEditing}
        profile={profile}
        formData={formData}
        userProfileLoading={userProfileLoading}
        userProfileError={userProfileError}
        setIsEditing={setIsEditing}
        handleInputChange={handleInputChange}
        handleProfileSubmit={handleProfileSubmit}
        handleDeleteProfile={handleDeleteProfile}
      />
      <PostsBlock
        myPosts={myPosts}
        isAuthenticated={isAuthenticated}
        profile={profile}
        showComments={showComments}
        setShowComments={setShowComments}
        commentTexts={commentTexts}
        setCommentTexts={setCommentTexts}
        handleDeletePostClick={handleDeletePostClick}
      />
      {profile && (
        <AdsBlock userId={profile.id} />
      )}
    </div>
  );
};

export default UserProfile;
