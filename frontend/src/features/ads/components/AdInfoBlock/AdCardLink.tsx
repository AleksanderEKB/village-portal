// frontend/src/features/ads/components/AdCardLink.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Advertisement } from '../../../../types/globalTypes';
import { getDefaultCategoryImage } from '../AdsFeed';
import adCardLinkStyles from '../../styles/adCardLink.module.scss';

interface AdCardLinkProps {
  ad: Advertisement;
  children: React.ReactNode;
}

const AdCardLink: React.FC<AdCardLinkProps> = ({ ad, children }) => {
  return (
    <Link
      to={`/ads/${ad.slug}/`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {ad.main_image ? (
        <div className={adCardLinkStyles.adsImageWrapperFeed}>
          <img src={ad.main_image} alt={ad.title} className={adCardLinkStyles.adsMainImage} />
        </div>
      ) : (
        <div className={adCardLinkStyles.adsImageWrapperFeed}>
          <img
            src={getDefaultCategoryImage(ad.category)}
            alt={ad.category}
            className={adCardLinkStyles.adsMainImage}
            style={{ opacity: 0.7 }}
          />
        </div>
      )}
      {children}
    </Link>
  );
};

export default AdCardLink;
