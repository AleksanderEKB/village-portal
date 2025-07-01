// frontend/src/features/ads/adsFormLogic.tsx
import type { AdsCategory } from '../../../types/globalTypes';

export function getPriceInputState(category: AdsCategory) {
  // Не показывать price для
  return !['free', 'loss', 'sundry'].includes(category);
}

export function getPricePlaceholder(category: AdsCategory) {
  if (category === 'service') return 'Стоимость услуг от';
  if (category === 'hire') return 'Оплата (необязательно заполнять)';
  return 'Цена';
}

export function getTitlePlaceholder(category: AdsCategory) {
  if (category === 'sell') return 'Что продаете?';
  if (category === 'buy') return 'Что хотите купить?';
  if (category === 'free') return 'Что отдаете?';
  if (category === 'service') return 'Услуга';
  return 'Заголовок';
}

export function allowAdditionalImages(category: AdsCategory) {
  // Категории, где нельзя добавлять доп. изображения
  return !(category === 'sundry' || category === 'hire');
}
