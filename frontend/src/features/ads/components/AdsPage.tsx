import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hook';
import { fetchAdById, removeAd } from '../adsSlice';
import axiosInstance from '../../../axiosInstance';
import { getDefaultCategoryImage } from '../utils/getDefaultCategoryImage';
import ImageGalleryModal from './ImageGalleryModal';
import AdInfoBlock from '../components/AdInfoBlock';
import AdOwnerMenu from './AdOwnerMenu';
import GalleryThumbnails from './GalleryThumbnails';

import '../scss_page/main.scss';

const AdsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const { currentAd, loading, error } = useAppSelector((state) => state.ads);
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (slug) dispatch(fetchAdById(slug));
  }, [dispatch, slug]);

  // Галерея
  const galleryImages = React.useMemo(() => {
    if (!currentAd) return [];
    const imagesArr = currentAd.images || [];
    const mainInImages = imagesArr.some(img => img.image === currentAd.main_image);
    if (currentAd.main_image && !mainInImages) {
      return [{ id: 'main', image: currentAd.main_image }, ...imagesArr];
    }
    return imagesArr;
  }, [currentAd]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!currentAd) return <div>Объявление не найдено.</div>;

  const ad = currentAd;
  const isOwner = currentUser && ad.user && currentUser.id === ad.user.id;

  const handleDeleteAd = async () => {
    if (!window.confirm('Удалить объявление?')) return;
    try {
      await axiosInstance.delete(`/api/ads/${ad.slug}/`);
      dispatch(removeAd(ad.id));
      navigate('/ads');
    } catch (e) {
      alert('Ошибка удаления');
    }
  };

  const handleMainImageClick = () => {
    if (galleryImages.length > 0) {
      setGalleryIndex(0);
      setGalleryOpen(true);
    }
  };

  return (
    <div className="ads-page-container">
      <div className="ads-card-page">
        {/* USER INFO */}
        <Link to={`/profile/${ad.user.id}`} className="ads-user-info">
          {ad.user?.avatar ? (
            <img src={ad.user.avatar} alt={ad.user.username} className="ads-user-avatar" />
          ) : (
            <div className="ads-user-avatar ads-user-avatar-stub">
              {ad.user.username[0].toUpperCase()}
            </div>
          )}
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
          <AdInfoBlock
            ad={ad}
            desktop
          />
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

        {/* МЕНЮ ВЛАДЕЛЬЦА */}
        {isOwner && (
          <AdOwnerMenu
            ad={ad}
            onDelete={handleDeleteAd}
          />
        )}
      </div>
    </div>
  );
};

export default AdsPage;
