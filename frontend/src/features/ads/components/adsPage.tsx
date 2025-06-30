import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import { fetchAdById, removeAd } from '../adsSlice';
import axiosInstance from '../../../axiosInstance';
import { formatTimeElapsed } from '../../shared/utils/formatTimeElapsed';
import { ADS_CATEGORY_LABELS } from '../../ads/adsCategories';
import type { AdsCategory } from '../../../types/globalTypes';
import ImageGalleryModal from './ImageGalleryModal';
import { faMoneyBill1, faLocationDot, faPhone, faEnvelope, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../scss_page/main.scss';

export const getDefaultCategoryImage = (category: AdsCategory | string) =>
  `/media/default/${category}.webp`;

const AdsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { currentAd, loading, error } = useSelector((state: RootState) => state.ads);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (slug) {
      dispatch(fetchAdById(slug));
    }
  }, [dispatch, slug]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setMenuOpen(false);
        }
      };
      if (menuOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      } else {
        document.removeEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [menuOpen]);

  const galleryImages = useMemo(() => {
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
        <Link to={`/profile/${ad.user.id}`} className="ads-user-info">
          {ad.user?.avatar ? (
            <img
              src={ad.user.avatar}
              alt={ad.user.username}
              className="ads-user-avatar"
            />
          ) : (
            <div className="ads-user-avatar ads-user-avatar-stub">
              {ad.user.username[0].toUpperCase()}
            </div>
          )}
          <span className="ads-user-name">{ad.user.username}</span>
        </Link>

        <div className="ads-details">
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
          {/* Этот блок отображается только на desktop (>699px) */}
          <div className="ads-info-block info-block-desktop">
            <div>
              <span className="ads-category">{ADS_CATEGORY_LABELS[ad.category] ?? ad.category}</span>
            </div>
            <h2>{ad.title}</h2>
            <hr />
            <div className="ads-description">{ad.description}</div>
            <hr />
            {ad.price &&
              <div>
                <span className="ads-price">
                  <FontAwesomeIcon className='icon-price' icon={faMoneyBill1} />
                  {ad.price && Number(ad.price).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
                </span>
              </div>
            }
            <hr />
            <div className="ads-location">
              <FontAwesomeIcon className='location' icon={faLocationDot} />
              {ad.location}
            </div>
            <div className="ads-contact">
              <FontAwesomeIcon className='contact' icon={faPhone} />
              {ad.contact_phone}
            </div>
            <div className="ads-contact">
              <FontAwesomeIcon className='contact' icon={faEnvelope} />
              {ad.contact_email}
            </div>
            <div className="ads-date">{formatTimeElapsed(ad.created_at)}</div>
          </div>
        </div>

        {/* Галерея миниатюр показывается только если больше одной картинки */}
        {galleryImages.length > 1 && (
          <div className="ads-images-gallery">
            {galleryImages.slice(1).map((img, idx) => (
              <img
                key={img.id}
                src={img.image}
                alt={`Фото ${ad.title}`}
                className="ads-gallery-image"
                onClick={() => {
                  setGalleryIndex(idx + 1);
                  setGalleryOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Модалка галереи открывается даже при одной картинке */}
        {galleryOpen && galleryImages.length > 0 && (
          <ImageGalleryModal
            images={galleryImages}
            initialIndex={galleryIndex}
            onClose={() => setGalleryOpen(false)}
          />
        )}

        {/* Этот блок отображается только на мобильных (<=699px) */}
        <div className="ads-info-block info-block-mobile">
          <div className="ads-category">{ADS_CATEGORY_LABELS[ad.category] ?? ad.category}</div>
          <h2>{ad.title}</h2>
          <hr />
          <div className="ads-description">{ad.description}</div>
          <hr />
          {ad.price &&
            <div>
              <span className="ads-price">
                <FontAwesomeIcon className='icon-price' icon={faMoneyBill1} />
                {ad.price && Number(ad.price).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
              </span>
            </div>
          }
          <hr />
          <div className="ads-location">
            <FontAwesomeIcon className='location' icon={faLocationDot} />
            {ad.location}
          </div>
          <div className="ads-contact">
            <FontAwesomeIcon className='contact' icon={faPhone} />
            {ad.contact_phone}
          </div>
          <div className="ads-contact">
            <FontAwesomeIcon className='contact' icon={faEnvelope} />
            {ad.contact_email}
          </div>
          <div className="ads-date">{formatTimeElapsed(ad.created_at)}</div>
        </div>
        {/* МЕНЮ В ПРАВОМ НИЖНЕМ УГЛУ */}
        {isOwner && (
          <div className="ads-menu-wrapper" ref={menuRef}>
            <button
              className="ads-menu-btn"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Меню"
            >
              <FontAwesomeIcon className='dropmenu' icon={faPenToSquare} size="lg" />
            </button>
            {menuOpen && (
              <div className="ads-menu-dropdown">
                <button
                  className="ads-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/ads/${ad.slug}/edit`);
                  }}
                >
                  Редактировать
                </button>
                <button
                  className="ads-menu-item ads-menu-item-delete"
                  onClick={handleDeleteAd}
                >
                  Удалить
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdsPage;
