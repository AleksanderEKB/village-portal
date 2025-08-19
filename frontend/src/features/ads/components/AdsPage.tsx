// frontend/src/features/ads/components/AdsPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import ImageGalleryModal from './ImageGalleryModal';
import AdInfoBlock from './AdInfoBlock';
import GalleryThumbnails from './GalleryThumbnails';
import { useAdsPage } from '../hooks/useAdsPage';
import AdOwnerPanel from './AdOwnerPanel';
import AdDate from './AdInfoBlock/AdDate';
import UserInfo from '../../shared/corpusculars/UserInfo/UserInfo';
import adsPageStyles from '../styles/adsPage.module.scss';

const AdsPage: React.FC = () => {
  const {
    currentAd: ad,
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
  } = useAdsPage();

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className={adsPageStyles.error}>{error}</div>;
  if (!ad) return <div>Объявление не найдено.</div>;

  return (
    <div className={adsPageStyles.adsPageContainer}>
      <div className={adsPageStyles.adsCardPage}>
        <UserInfo user={ad.user} />
        <div className={adsPageStyles.adsDetails}>
          {/* MAIN IMAGE */}
          <div
            className={adsPageStyles.adsMainImageWrapperPage}
            style={{ cursor: galleryImages.length > 0 ? 'pointer' : 'default' }}
            onClick={handleMainImageClick}
          >
            <img
              src={ad.main_image || getDefaultCategoryImage(ad.category)}
              alt={ad.title}
              className={adsPageStyles.adsMainImage}
              style={ad.main_image ? {} : { opacity: 0.7 }}
            />
          </div>

          {/* INFO BLOCKS */}
          <AdInfoBlock ad={ad} desktop />
        </div>

        {/* ГАЛЕРЕЯ МИНИАТЮР */}
        <GalleryThumbnails
          images={galleryImages}
          setGalleryIndex={setGalleryIndex}
          setGalleryOpen={setGalleryOpen}
          adTitle={ad.title}
        />

        {/* МОДАЛЬНОЕ ОКНО ГАЛЕРЕИ */}
        {galleryOpen && (
          <ImageGalleryModal
            images={galleryImages}
            initialIndex={galleryIndex}
            onClose={() => setGalleryOpen(false)}
          />
        )}

        {/* МОБИЛЬНЫЙ INFO BLOCK */}
        <AdInfoBlock ad={ad} desktop={false} />

        {/* МЕНЮ ВЛАДЕЛЬЦА и статус */}
        {isOwner && (
          <AdOwnerPanel
            ad={ad}
            onDelete={handleDeleteAd}
            onSwitchStatus={handleSwitchStatus}
            switching={switchingStatus}
          />
        )}
      </div>
      <AdDate created_at={ad.created_at} updated_at={ad.updated_at} />
    </div>
  );
};

export default AdsPage;
