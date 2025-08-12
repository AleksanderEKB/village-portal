// frontend/src/features/ads/utils/getDefaultCategoryImage.tsx
import { AdsCategory } from '../../../types/globalTypes';

export const getDefaultCategoryImage = (category: AdsCategory | string) =>
  `/media/default/${category}.webp`;
