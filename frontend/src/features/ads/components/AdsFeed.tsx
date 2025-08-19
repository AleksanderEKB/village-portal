// frontend/src/features/ads/components/ads-feed.tsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import { fetchAdsPaginated, clearAds } from '../adsSlice';
import type { AdsCategory } from '../../../types/globalTypes';
import { Link } from 'react-router-dom';
import AdPriceBlock from './AdInfoBlock/AdPrice';
import AdCategory from './AdInfoBlock/AdCategory';
import AdTitleDate from './AdInfoBlock/AdTitle';
import UserInfo from '../../shared/corpusculars/UserInfo/UserInfo';
import AdCardLink from '../components/AdInfoBlock/AdCardLink';
import adsFeedStyles from '../styles/adsFeed.module.scss';

export const getDefaultCategoryImage = (category: AdsCategory | string) =>
  `/media/default/${category}.webp`;

const ITEMS_PER_PAGE = 4;

const AdsFeed: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { ads, loading, error, count } = useSelector((state: RootState) => state.ads);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    dispatch(clearAds()); // сбрасываем при заходе на страницу
    dispatch(fetchAdsPaginated({ limit: ITEMS_PER_PAGE, offset: 0 }));
    // eslint-disable-next-line
  }, []);

  const handleShowMore = () => {
    dispatch(fetchAdsPaginated({ limit: ITEMS_PER_PAGE, offset: ads.length }));
  };

  return (
    <div className={adsFeedStyles.adsFeedContainer}>
      <h1>Объявления</h1>
      <div className={adsFeedStyles.adsContent}>
        {isAuthenticated && (
          <div className={adsFeedStyles.centerBtn}>
            <Link to="/ads/create-ads" className={adsFeedStyles.greyBtn}>
              Создать объявление
            </Link>
          </div>
        )}
        {loading && <div>Загрузка...</div>}
        {error && <div className={adsFeedStyles.error}>{error}</div>}

        <div className={adsFeedStyles.adsGrid}>
          {ads.map(ad => (
            <div className={adsFeedStyles.adsCard} key={ad.id}>
              <UserInfo user={ad.user} />
              <AdCardLink ad={ad}>
                <AdCategory category={ad.category} />
                {/* <hr /> */}
                <AdTitleDate title={ad.title} />
                {/* <hr /> */}
                <AdPriceBlock price={ad.price} />
              </AdCardLink>
            </div>
          ))}
        </div>
        {ads.length < (count || 0) && (
          <div className={adsFeedStyles.centerBtn}>
            <button
              className={adsFeedStyles.greyBtn}
              onClick={handleShowMore}
              disabled={loading}
            >
              {loading ? 'Загрузка...' : 'Показать ещё'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdsFeed;
