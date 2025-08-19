// frontend/src/features/ads/components/AdInfoBlock/AdLocation.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { Advertisement } from '../../../../types/globalTypes';
import adContactStyles from '../../styles/adInfoBlock.module.scss';

interface Props {
  contact_phone: Advertisement['contact_phone'];
}

const AdContact_phone: React.FC<Props> = ({ contact_phone }) => (
    <div className={adContactStyles.adsContact}>
        <FontAwesomeIcon className={adContactStyles.contact} icon={faPhone} />
        <span className={adContactStyles.phoneNumber}>{contact_phone}</span>
    </div>
);

export default React.memo(AdContact_phone);
