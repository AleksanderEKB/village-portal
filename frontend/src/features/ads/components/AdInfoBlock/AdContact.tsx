// frontend/src/features/ads/components/AdInfoBlock/AdLocation.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill1, faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons';
import { Advertisement } from '../../../../types/globalTypes';

interface Props {
  contact_phone: Advertisement['contact_phone'];
}

const AdContact_phone: React.FC<Props> = ({ contact_phone }) => (
    <div className="ads-contact">
        <FontAwesomeIcon className='contact' icon={faPhone} />
        <span className="phone-number">{contact_phone}</span>
    </div>
);

export default React.memo(AdContact_phone);
