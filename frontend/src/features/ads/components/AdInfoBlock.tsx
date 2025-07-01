import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill1, faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons';
import { ADS_CATEGORY_LABELS } from '../utils/adsCategories';
import { Advertisement } from '../../../types/globalTypes';
import { formatTimeElapsed } from '../../shared/utils/formatTimeElapsed';

interface Props {
  ad: Advertisement;
  desktop: boolean;
}

const AdInfoBlock: React.FC<Props> = ({ ad, desktop }) => (
  <div className={`ads-info-block ${desktop ? 'info-block-desktop' : 'info-block-mobile'}`}>
    <div>
      <span className="ads-category">{ADS_CATEGORY_LABELS[ad.category] ?? ad.category}</span>
    </div>
    <h2>{ad.title}</h2>
    <hr />
    <div className="ads-description">{ad.description}</div>
    <hr />
    {ad.price && (
      <div>
        <span className="ads-price">
          <FontAwesomeIcon className='icon-price' icon={faMoneyBill1} />
          {Number(ad.price).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
        </span>
        <hr />
      </div>
    )}
    <div className="ads-location">
      <FontAwesomeIcon className='location' icon={faLocationDot} />
      {ad.location}
    </div>
    <div className="ads-contact">
      <FontAwesomeIcon className='contact' icon={faPhone} />
      {ad.contact_phone}
    </div>
    <div className="ads-date">{formatTimeElapsed(ad.created_at)}</div>
  </div>
);

export default React.memo(AdInfoBlock);
