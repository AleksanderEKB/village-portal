// frontend/src/features/ads/components/FieldError.tsx
import React from 'react';

interface Props {
  message?: string;
}

const FieldError: React.FC<Props> = ({ message }) =>
  message ? <div className="error">{message}</div> : null;

export default FieldError;
