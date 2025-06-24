// frontend/src/features/userProfile/hooks/useYserProfile.tsx
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../app/hook';
import { useNavigate } from 'react-router-dom';
import { fetchPosts, deletePost } from '../../posts/postsSlice';
import {
  updateUserProfile,
  fetchUserProfile,
  deleteUserProfile,
  deleteAdvertisement,
} from '../userProfileSlice';
import type { RootState } from '../../../app/store';
import type { UserWithAvatar, Advertisement } from '../../../types/globalTypes';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const useUserProfile = () => {
  const profile = useSelector((state: RootState) => state.userProfile.profile) as UserWithAvatar | null;
  const userProfileLoading = useSelector((state: RootState) => state.userProfile.loading);
  const userProfileError = useSelector((state: RootState) => state.userProfile.error);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const allPosts = useSelector((state: RootState) => state.posts.posts);
  const userAds: Advertisement[] = useSelector((state: RootState) => state.userProfile.ads) || [];

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    email: (profile as any)?.email || '',
    avatar: null as File | null,
  });
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (currentUserId) {
      dispatch(fetchUserProfile(currentUserId));
    }
    dispatch(fetchPosts());
  }, [dispatch, currentUserId]);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username,
        email: (profile as any).email,
        avatar: null,
      });
    }
  }, [profile]);

  const myPosts = allPosts.filter(post => post.author.id === currentUserId);

  const handleDeletePostClick = (postId: number) => {
    dispatch(deletePost(postId));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "avatar" && files && files[0]) {
      if (files[0].size > MAX_FILE_SIZE) {
        alert("Файл слишком большой (макс. 5 МБ)");
        return;
      }
      setFormData((prev) => ({ ...prev, avatar: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    if (formData.avatar) {
      data.append("avatar", formData.avatar);
    }
    const res = await dispatch(updateUserProfile({ userId: currentUserId, formData: data }));
    if (updateUserProfile.fulfilled.match(res)) {
      setIsEditing(false);
      dispatch(fetchUserProfile(currentUserId));
    } else if (updateUserProfile.rejected.match(res)) {
      alert((res.payload as string) || "Ошибка обновления профиля");
    }
  };

  const handleDeleteProfile = async () => {
    if (!currentUserId) return;
    if (!window.confirm("Вы уверены, что хотите удалить свой профиль? Это действие необратимо!")) return;
    const res = await dispatch(deleteUserProfile(currentUserId));
    if (deleteUserProfile.fulfilled.match(res)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
      navigate('/login');
    } else if (deleteUserProfile.rejected.match(res)) {
      alert((res.payload as string) || "Ошибка удаления профиля");
    }
  };

  const handleDeleteAd = async (slug: string) => {
    if (window.confirm('Удалить объявление?')) {
      await dispatch(deleteAdvertisement(slug));
    }
  };

  return {
    profile,
    userProfileLoading,
    userProfileError,
    isAuthenticated,
    userAds,
    isEditing,
    setIsEditing,
    formData,
    setFormData,
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
  };
};
