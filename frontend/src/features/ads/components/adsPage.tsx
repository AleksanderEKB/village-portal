// frontend/src/features/ads/pages/adsPage.tsx

import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import { fetchAdById, removeAd } from '../adsSlice';
import axiosInstance from '../../../axiosInstance';
import { formatTimeElapsed } from '../../shared/utils/formatTimeElapsed';
import { ADS_CATEGORY_LABELS } from '../../ads/adsCategories';
import type { AdsCategory } from '../../../types/globalTypes';
import '../styles.scss';

export const getDefaultCategoryImage = (category: AdsCategory | string) =>
  `/media/default/${category}.webp`;


const AdsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentAd, loading, error } = useSelector((state: RootState) => state.ads);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (slug) {
      dispatch(fetchAdById(slug));
    }
  }, [dispatch, slug]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!currentAd) return <div>Объявление не найдено.</div>;

  const ad = currentAd;
  const isOwner = currentUser && ad.user && currentUser.id === ad.user.id;

  const handleDeleteAd = async () => {
    if (!window.confirm('Удалить объявление?')) return;
    try {
      await axiosInstance.delete(`/api/ads/${ad.slug}/`);
      dispatch(removeAd(ad.id)); // если используешь такой action
      navigate('/ads');
    } catch (e) {
      alert('Ошибка удаления');
    }
  };

  return (
    <div className="ads-page-container">
      <div className="ads-card ads-card--page">
        <Link to={`/profile/${ad.user.id}`} className="ads-user-info">
                {ad.user?.avatar ? (
                  <img
                    src={ad.user.avatar}
                    alt={ad.user.username}
                    className="ads-user-avatar"
                  />
                ) : (
                  <div className="ads-user-avatar ads-user-avatar--stub">
                    {ad.user.username[0].toUpperCase()}
                  </div>
                )}
                <span className="ads-user-name">{ad.user.username}</span>
              </Link>        
              <div className="ads-main-image-wrapper">
                <img
                  src={ad.main_image || getDefaultCategoryImage(ad.category)}
                  alt={ad.title}
                  className="ads-main-image"
                  style={ad.main_image ? {} : { opacity: 0.7 }}
                />
              </div>
        <h2>{ad.title}</h2>
        <div className="ads-category">{ADS_CATEGORY_LABELS[ad.category] ?? ad.category}</div>
        <div className="ads-description">{ad.description}</div>
        {ad.price && <div className="ads-price">{ad.price} ₽</div>}
        <div className="ads-location">{ad.location}</div>
        <div className="ads-contact">
          {ad.contact_phone && <div>Тел: {ad.contact_phone}</div>}
          {ad.contact_email && <div>Email: {ad.contact_email}</div>}
        </div>
        <div className="ads-date">{formatTimeElapsed(ad.created_at)}</div>
        {ad.images && ad.images.length > 0 && (
          <div className="ads-images-gallery">
            {ad.images.map(img => (
              <img
                key={img.id}
                src={img.image}
                alt={`Фото ${ad.title}`}
                className="ads-gallery-image"
                style={{ width: 100, height: 100, objectFit: 'cover', marginRight: 8 }}
              />
            ))}
          </div>
        )}
        {isOwner && (
          <div className="ads-actions" style={{ marginTop: 16 }}>
            <button
              className="ads-edit-btn"
              onClick={() => navigate(`/ads/${ad.slug}/edit`)}
              style={{
                marginRight: 8,
                padding: '6px 16px',
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Редактировать
            </button>
            <button
              className="ads-delete-btn"
              onClick={handleDeleteAd}
              style={{
                padding: '6px 16px',
                background: '#d32f2f',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Удалить
            </button>
          </div>
        )}
      </div>
      <button onClick={() => navigate(-1)} className="ads-back-btn">← Назад</button>
    </div>
  );
};

export default AdsPage;
