// frontend/src/features/userProfile/components/UserProfile.tsx
import React from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import ProfileBlock from './ProfileBlock';
import PostsBlock from './PostsBlock';
import AdsBlock from './AdsBlock';
import '../styles.scss';


const UserProfile: React.FC = () => {
  const {
    profile,
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
      <AdsBlock
        userAds={userAds}
        handleDeleteAd={handleDeleteAd}
      />
    </div>
  );
};

export default UserProfile;
