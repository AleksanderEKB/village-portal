// frontend/src/features/ads/components/AdInfoBlock/AdDescription.tsx
import React from 'react';
import { Advertisement } from '../../../../types/globalTypes';
import adDescriptionStyles from '../../styles/adDescription.module.scss';

interface Props {
  description: Advertisement['description'];
}

const AdDescription: React.FC<Props> = ({ description }) => (
  <div className={adDescriptionStyles.adsDescription}>{description}</div>
);

export default React.memo(AdDescription);
