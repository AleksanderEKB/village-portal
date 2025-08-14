// frontend/src/features/ads/components/AdCardLink.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Advertisement } from '../../../../types/globalTypes';
import { getDefaultCategoryImage } from '../AdsFeed';

interface AdCardLinkProps {
  ad: Advertisement;
  children: React.ReactNode;
}

const AdCardLink: React.FC<AdCardLinkProps> = ({ ad, children }) => {
  return (
    <Link
      to={`/ads/${ad.slug}/`}
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
            alt={ad.category}
            className="ads-main-image"
            style={{ opacity: 0.7 }}
          />
        </div>
      )}
      {children}
    </Link>
  );
};

export default AdCardLink;
