// frontend/src/features/ads/components/AdInfoBlock/AdCategory.tsx
import React from 'react';
import { ADS_CATEGORY_LABELS } from '../../utils/adsCategories';
import { Advertisement } from '../../../../types/globalTypes';
import adCategoryStyle from '../../styles/adCategory.module.scss';

interface Props {
  category: Advertisement['category'];
}

const AdCategory: React.FC<Props> = ({ category }) => (
    <div>
        <span className={adCategoryStyle.adsCategory}>{ADS_CATEGORY_LABELS[category] ?? category}</span>
    </div>
    
);

export default React.memo(AdCategory);
