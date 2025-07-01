import { AdsCategory } from '../../../types/globalTypes';

export const getDefaultCategoryImage = (category: AdsCategory | string) =>
  `/media/default/${category}.webp`;
