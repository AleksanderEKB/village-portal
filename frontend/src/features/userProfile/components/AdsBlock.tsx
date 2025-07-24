// frontend/src/features/userProfile/components/AdsBlock.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import { fetchUserAdsPaginated, clearUserAds } from '../userProfileSlice';
import type { Advertisement, AdsCategory } from '../../../types/globalTypes';
import { Link } from 'react-router-dom';
import AdCategory from '../../ads/components/AdInfoBlock/AdCategory';
import AdTitle from '../../ads/components/AdInfoBlock/AdTitle';
import AdPrice from '../../ads/components/AdInfoBlock/AdPrice';
import '../styles/main.scss';

export const getDefaultCategoryImage = (category: AdsCategory | string) =>
  `/media/default/${category}.webp`;

const ITEMS_PER_PAGE = 4;

interface AdsBlockProps {
  userId: number | string;
}

const AdsBlock: React.FC<AdsBlockProps> = ({ userId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { ads, adsCount, loading } = useSelector((state: RootState) => state.userProfile);

  // Первая загрузка
  useEffect(() => {
    dispatch(clearUserAds());
    dispatch(fetchUserAdsPaginated({ userId, limit: ITEMS_PER_PAGE, offset: 0 }));
    // eslint-disable-next-line
  }, [userId]);

  const handleShowMore = () => {
    dispatch(fetchUserAdsPaginated({ userId, limit: ITEMS_PER_PAGE, offset: ads.length }));
  };

  return (
    <div className="ads-feed-container">
      <h1>Мои объявления</h1>
      <div className='ads-content'>
        <div className='center-btn-1'>
          <Link to="/ads/create-ads" className="func-btn-1">Создать объявление</Link>
        </div>
        {ads.length === 0 && <p>У вас пока нет объявлений.</p>}
        <div className="ads-grid">
          {ads.map(ad => (
            <div key={ad.id} className="ads-card-user">
              <Link
                to={`/ads/${ad.slug}/`}
                className="ads-card-link"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="ads-main-image-wrapper">
                  <img
                    src={ad.main_image || getDefaultCategoryImage(ad.category)}
                    alt={ad.title}
                    className="ads-main-image"
                    style={ad.main_image ? {} : { opacity: 0.7 }}
                  />
                </div>
                <AdCategory category={ad.category} />
                <hr />
                <AdTitle title={ad.title} />
                <hr />
                <AdPrice price={ad.price} />
              </Link>
            </div>
          ))}
        </div>
        {ads.length < (adsCount || 0) && (
          <div className="center-btn-2">
            <button className="func-btn-1" onClick={handleShowMore} disabled={loading}>
              {loading ? 'Загрузка...' : 'Загрузить ещё'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdsBlock;
