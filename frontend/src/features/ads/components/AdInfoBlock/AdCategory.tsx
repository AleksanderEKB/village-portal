// frontend/src/features/ads/components/AdInfoBlock/AdCategory.tsx
import React from 'react';
import { ADS_CATEGORY_LABELS } from '../../utils/adsCategories';
import { Advertisement } from '../../../../types/globalTypes';

interface Props {
  category: Advertisement['category'];
}

const AdCategory: React.FC<Props> = ({ category }) => (
    <div>
        <span className="ads-category">{ADS_CATEGORY_LABELS[category] ?? category}</span>
    </div>
    
);

export default React.memo(AdCategory);
