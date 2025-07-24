// frontend/src/features/ads/components/AdPriceBlock.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill1 } from '@fortawesome/free-solid-svg-icons';
import { Advertisement } from '../../../../types/globalTypes';

const AdPrice: React.FC<{ price?: Advertisement['price'] }> = ({ price }) => {
  if (!price) return null;

  return (
    <div className='item-right'>
      <span className="ads-price">
        <FontAwesomeIcon className="icon-price" icon={faMoneyBill1} />
        {Number(price).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
      </span>
    </div>
  );
};

export default React.memo(AdPrice);
