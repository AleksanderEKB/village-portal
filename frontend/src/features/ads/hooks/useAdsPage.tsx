// src/features/ads/hooks/useAdsPage.ts
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hook';
import { fetchAdById, removeAd } from '../adsSlice';
import axiosInstance from '../../../axiosInstance';
import { getDefaultCategoryImage } from '../utils/getDefaultCategoryImage';

export const useAdsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [switchingStatus, setSwitchingStatus] = useState(false);

  const { currentAd, loading, error } = useAppSelector((state) => state.ads);
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (slug) dispatch(fetchAdById(slug));
  }, [dispatch, slug]);

  const galleryImages = useMemo(() => {
    if (!currentAd) return [];
    const imagesArr = currentAd.images || [];
    const mainInImages = imagesArr.some(img => img.image === currentAd.main_image);
    if (currentAd.main_image && !mainInImages) {
      return [{ id: 'main', image: currentAd.main_image }, ...imagesArr];
    }
    return imagesArr;
  }, [currentAd]);

  const isOwner = currentUser && currentAd?.user && currentUser.id === currentAd.user.id;

  const handleDeleteAd = useCallback(async () => {
    if (!currentAd) return;
    if (!window.confirm('Удалить объявление?')) return;
    try {
      await axiosInstance.delete(`/api/ads/${currentAd.slug}/`);
      dispatch(removeAd(currentAd.id));
      navigate('/ads');
    } catch (e) {
      alert('Ошибка удаления');
    }
  }, [currentAd, dispatch, navigate]);

  const handleMainImageClick = useCallback(() => {
    if (galleryImages.length > 0) {
      setGalleryIndex(0);
      setGalleryOpen(true);
    }
  }, [galleryImages]);

  const handleSwitchStatus = useCallback(async () => {
    if (!currentAd) return;
    setSwitchingStatus(true);
    try {
      await axiosInstance.post(`/api/ads/${currentAd.slug}/switch-status/`);
      await dispatch(fetchAdById(currentAd.slug));
    } finally {
      setSwitchingStatus(false);
    }
  }, [currentAd, dispatch]);

  return {
    slug,
    currentAd,
    loading,
    error,
    currentUser,
    isOwner,
    galleryOpen,
    setGalleryOpen,
    galleryIndex,
    setGalleryIndex,
    galleryImages,
    switchingStatus,
    handleDeleteAd,
    handleMainImageClick,
    handleSwitchStatus,
    getDefaultCategoryImage,
  };
};
