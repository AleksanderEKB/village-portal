// frontend/src/features/ads/components/ads-feed.tsx

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import { fetchAdsPaginated, clearAds } from '../adsSlice';
import type { AdsCategory } from '../../../types/globalTypes';
import { useNavigate, Link } from 'react-router-dom';
import '../feed_styles.scss';
import { faMoneyBill1 } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatTimeElapsed } from '../../shared/utils/formatTimeElapsed';

export const getDefaultCategoryImage = (category: AdsCategory | string) =>
  `/media/default/${category}.webp`;

const ITEMS_PER_PAGE = 4;

const AdsFeed: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { ads, loading, error, count } = useSelector((state: RootState) => state.ads);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearAds()); // сбрасываем при заходе на страницу
    dispatch(fetchAdsPaginated({ limit: ITEMS_PER_PAGE, offset: 0 }));
    // eslint-disable-next-line
  }, []);

  const handleShowMore = () => {
    dispatch(fetchAdsPaginated({ limit: ITEMS_PER_PAGE, offset: ads.length }));
  };

  return (
    <div className="ads-feed-container">
      <h1>Объявления</h1>
      <div className='ads-content'>
        {isAuthenticated && (
          <div className='center-btn-1'>
            <Link to="/ads/create-ads" className="func-btn-1">
              Создать объявление
            </Link>
          </div>
        )}
        {loading && <div>Загрузка...</div>}
        {error && <div className="error">{error}</div>}

        <div className="ads-grid">
          {ads.map(ad => (
            <div className="ads-card" key={ad.id}>
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
              <Link
                to={`/ads/${ad.slug}/`}
                key={ad.id}
                className="ads-card-link"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {ad.main_image ? (
                  <div className="ads-main-image-wrapper">
                    <img src={ad.main_image} alt={ad.title} className="ads-main-image" />
                  </div>
                ) : (
                  <div className="ads-main-image-wrapper">
                    <img
                      src={getDefaultCategoryImage(ad.category)}
                      alt={ad.category_label}
                      className="ads-main-image"
                      style={{ opacity: 0.7 }}
                    />
                  </div>
                )}
                <div>
                  <span className="ads-category">{ad.category_label}</span>
                </div>
                <hr />
                <h2>{ad.title}</h2>
                {ad.price && (
                  <div className="ads-price">
                    <FontAwesomeIcon className='icon-price' icon={faMoneyBill1} />
                    {ad.price} ₽
                  </div>
                )}
                <div className="ads-date">{formatTimeElapsed(ad.created_at)}</div>
              </Link>
            </div>
          ))}
        </div>

        {ads.length < (count || 0) && (
          <div className="center-btn-2">
            <button className="func-btn-1" onClick={handleShowMore} disabled={loading}>
              {loading ? 'Загрузка...' : 'Показать ещё'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdsFeed;
