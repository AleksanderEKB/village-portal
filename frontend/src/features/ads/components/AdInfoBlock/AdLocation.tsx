// frontend/src/features/ads/components/AdInfoBlock/AdLocation.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Advertisement } from '../../../../types/globalTypes';
import '../../../shared/styles/general.scss';
import adLocationStyles from '../../styles/adInfoBlock.module.scss';

interface Props {
  location: Advertisement['location'];
}

const AdLocation: React.FC<Props> = ({ location }) => (
  <div className={adLocationStyles.adsLocation}>
    <FontAwesomeIcon className={adLocationStyles.location} icon={faLocationDot} />
    {location}
  </div>
);

export default React.memo(AdLocation);
