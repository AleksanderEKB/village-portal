// frontend/src/features/ads/components/AdsPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import ImageGalleryModal from './ImageGalleryModal';
import AdInfoBlock from './AdInfoBlock';
import GalleryThumbnails from './GalleryThumbnails';
import { useAdsPage } from '../hooks/useAdsPage';
import AdOwnerPanel from './AdOwnerPanel';

import '../styles/scss_page/main.scss';

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
  if (error) return <div className="error">{error}</div>;
  if (!ad) return <div>Объявление не найдено.</div>;

  return (
    <div className="ads-page-container">
      <div className="ads-card-page">
        {/* USER INFO */}
        <Link to={`/profile/${ad.user.id}`} className="ads-user-info">
          <img
            src={ad.user.avatar}
            alt={ad.user.username}
            className="ads-user-avatar"
            onError={e => {
              (e.currentTarget as HTMLImageElement).src = '/media/default/avatar.webp';
            }}
          />
          <span className="ads-user-name">{ad.user.username}</span>
        </Link>
        <div className="ads-details">
          {/* MAIN IMAGE */}
          <div
            className="ads-main-image-wrapper-page"
            style={{ cursor: galleryImages.length > 0 ? 'pointer' : 'default' }}
            onClick={handleMainImageClick}
          >
            <img
              src={ad.main_image || getDefaultCategoryImage(ad.category)}
              alt={ad.title}
              className="ads-main-image"
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
    </div>
  );
};

export default AdsPage;
