// frontend/src/features/ads/constants.tsx
import type { AdsCategory } from '../../types/globalTypes';

export const CATEGORY_OPTIONS: { value: AdsCategory, label: string }[] = [
  { value: 'sell', label: 'Продаю' },
  { value: 'buy', label: 'Куплю' },
  { value: 'free', label: 'Отдам даром' },
  { value: 'service', label: 'Услуги' },
  { value: 'hire', label: 'Нужна услуга/работник' },
  { value: 'loss', label: 'Потеряшки'},
  { value: 'sundry', label: 'Разное' },
];

export const MAX_IMAGES = 5;
