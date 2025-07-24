// frontend/src/features/ads/components/AdInfoBlock.tsx
import React from 'react';
import { Advertisement } from '../../../types/globalTypes';
import AdPrice from './AdInfoBlock/AdPrice';
import AdDescription from './AdInfoBlock/AdDescription';
import AdLocation from './AdInfoBlock/AdLocation';
import AdContact from './AdInfoBlock/AdContact';
import AdTitle from './AdInfoBlock/AdTitle';
import AdCategory from './AdInfoBlock/AdCategory';


interface Props {
  ad: Advertisement;
  desktop: boolean;
}

const AdInfoBlock: React.FC<Props> = ({ ad, desktop }) => (
  <div className={`ads-info-block ${desktop ? 'info-block-desktop' : 'info-block-mobile'}`}>
    <AdCategory category={ad.category} />
    <AdTitle title={ad.title} />
    <hr />
    <AdDescription description={ad.description} />
    <hr />
    <AdPrice price={ad.price} />
    <AdLocation location={ad.location} />
    <AdContact contact_phone={ad.contact_phone} />
  </div>
);

export default React.memo(AdInfoBlock);
