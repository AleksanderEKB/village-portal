// frontend/src/features/ads/components/_types.ts
import React from 'react';

export type InputRef =
  | React.MutableRefObject<HTMLInputElement | null>
  | React.RefObject<HTMLInputElement>;
