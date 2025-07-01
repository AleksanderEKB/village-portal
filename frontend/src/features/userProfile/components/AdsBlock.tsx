import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Advertisement, AdsCategory } from '../../../types/globalTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill1 } from '@fortawesome/free-solid-svg-icons';
import { formatTimeElapsed } from '../../shared/utils/formatTimeElapsed';
import { ADS_CATEGORY_LABELS } from '../../ads/utils/adsCategories';
import { usePagination } from '../../shared/utils/pagination';
import Pagination from '../../shared/components/Pagination';

export const getDefaultCategoryImage = (category: AdsCategory | string) =>
  `/media/default/${category}.webp`;

interface AdsBlockProps {
  userAds: Advertisement[];
  handleDeleteAd: (slug: string) => void;
}

const ITEMS_PER_PAGE = 4;

const AdsBlock: React.FC<AdsBlockProps> = ({
  userAds,
  handleDeleteAd,
}) => {
  const [page, setPage] = useState(1);

  // Используем usePagination для расчёта.
  const { totalPages, currentItems } = usePagination<Advertisement>(
    userAds,
    page,
    ITEMS_PER_PAGE
  );

  return (
    <div className="ads-feed-container">
      <h1>Мои объявления</h1>
      <div className='ads-content'>
        <Link to="/ads/create-ads" className="func-btn-1">Создать объявление</Link>
        {userAds.length === 0 && <p>У вас пока нет объявлений.</p>}
        <div className="ads-grid">
          {currentItems.map((ad) => (
            <div key={ad.id} className="ads-card">
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
                <div className="ads-category">
                  {ADS_CATEGORY_LABELS[ad.category] ?? ad.category}
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
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <Link to={`/ads/${ad.slug}/edit`} className="func-btn-1">Редактировать</Link>
                <button onClick={() => handleDeleteAd(ad.slug)} className="delete-btn">
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Пагинация */}
        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          prevLabel="Назад"
          nextLabel="Вперед"
        />
      </div>
    </div>
  );
};

export default AdsBlock;
