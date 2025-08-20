// frontend/src/features/ads/components/PriceField.tsx
import React from 'react';
import FieldError from './FieldError';

interface Props {
  show: boolean;
  value: string;
  placeholder: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  className?: string;
  error?: string;
}

const PriceField: React.FC<Props> = ({
  show,
  value,
  placeholder,
  onChange,
  className,
  error,
}) => {
  if (!show) return null;
  return (
    <>
      <input
        name="price"
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={className}
      />
      <FieldError message={error} />
    </>
  );
};

export default PriceField;
