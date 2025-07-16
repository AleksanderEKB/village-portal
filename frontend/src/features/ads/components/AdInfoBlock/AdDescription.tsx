// frontend/src/features/ads/components/AdInfoBlock/AdDescription.tsx
import React from 'react';
import { Advertisement } from '../../../../types/globalTypes';

interface Props {
  description: Advertisement['description'];
}

const AdDescription: React.FC<Props> = ({ description }) => (
  <div className="ads-description">{description}</div>
);

export default React.memo(AdDescription);
