// frontend/src/features/ads/components/AdInfoBlock/AdLocation.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Advertisement } from '../../../../types/globalTypes';

interface Props {
  location: Advertisement['location'];
}

const AdLocation: React.FC<Props> = ({ location }) => (
  <div className="ads-location">
    <FontAwesomeIcon className='location' icon={faLocationDot} />
    {location}
  </div>
);

export default React.memo(AdLocation);
