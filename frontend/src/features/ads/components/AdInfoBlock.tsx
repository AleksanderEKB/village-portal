// frontend/src/features/ads/components/AdInfoBlock.tsx
import React from 'react';
import { Advertisement } from '../../../types/globalTypes';
import AdPrice from './AdInfoBlock/AdPrice';
import AdDescription from './AdInfoBlock/AdDescription';
import AdLocation from './AdInfoBlock/AdLocation';
import AdContact from './AdInfoBlock/AdContact';
import AdTitle from './AdInfoBlock/AdTitle';
import AdCategory from './AdInfoBlock/AdCategory';
import adInfoBlockStyles from '../styles/adInfoBlock.module.scss';


interface Props {
  ad: Advertisement;
  desktop: boolean;
}

const AdInfoBlock: React.FC<Props> = ({ ad, desktop }) => (
  <div
    className={`${adInfoBlockStyles.adsInfoBlock} ${
      desktop ? adInfoBlockStyles.infoBlockDesktop : adInfoBlockStyles.infoBlockMobile
    }`}
  >
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
