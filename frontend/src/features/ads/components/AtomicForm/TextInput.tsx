// frontend/src/features/ads/components/TextInput.tsx
import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  value: string;
  className?: string;
}

const TextInput: React.FC<Props> = ({ name, value, className, ...rest }) => (
  <input name={name} value={value} className={className} {...rest} />
);

export default TextInput;
