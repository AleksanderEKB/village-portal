// frontend/src/features/ads/components/TextArea.tsx
import React from 'react';

interface Props
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  value: string;
  className?: string;
}

const TextArea: React.FC<Props> = ({ name, value, className, ...rest }) => (
  <textarea name={name} value={value} className={className} {...rest} />
);

export default TextArea;
