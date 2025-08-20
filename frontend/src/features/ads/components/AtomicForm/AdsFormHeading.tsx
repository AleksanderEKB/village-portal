// frontend/src/features/ads/components/AdsFormHeading.tsx
import React from 'react';

interface Props {
  isEdit: boolean;
}

const AdsFormHeading: React.FC<Props> = ({ isEdit }) => (
  <h1 className="ads-form__heading">
    {isEdit ? 'Редактирование объявления' : 'Создание объявления'}
  </h1>
);

export default AdsFormHeading;
