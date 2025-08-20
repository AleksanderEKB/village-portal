// frontend/src/features/ads/components/SubmitButton.tsx
import React from 'react';

interface Props {
  loading: boolean;
  disabled: boolean;
  isEdit: boolean;
}

const SubmitButton: React.FC<Props> = ({ loading, disabled, isEdit }) => (
  <button type="submit" disabled={disabled}>
    {loading ? 'Отправка...' : isEdit ? 'Сохранить' : 'Опубликовать'}
  </button>
);

export default SubmitButton;
