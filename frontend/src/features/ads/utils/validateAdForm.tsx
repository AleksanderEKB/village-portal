import type { AdsCategory } from '../../../types/globalTypes';

export type AdFormValidationErrors = {
  title?: string;
  description?: string;
  price?: string;
  location?: string;
  contact_phone?: string;
  main_image?: string;
  images?: string;
};

function isPhone(phone: string): boolean {
  if (!/^[\d\s]{7,20}$/.test(phone)) {
    return false;
  }
  const digits = phone.replace(/\D/g, '');
  return digits.length <= 11 && digits.length >= 7;
}

function isImageFile(file: File | null): boolean {
  if (!file) return false;
  return file.type.startsWith('image/');
}


export function validateAdForm(
  values: {
    title: string;
    description: string;
    category: AdsCategory;
    price: string;
    location: string;
    contact_phone: string;
    main_image: File | null;
    images: File[];
  },
  isEdit: boolean = false
): AdFormValidationErrors {
  const errors: AdFormValidationErrors = {};

  if (!values.title || values.title.trim().length < 3) {
    errors.title = 'Введите заголовок (минимум 3 символа)';
  }
  if (!values.description || values.description.trim().length < 10) {
    errors.description = 'Описание (минимум 10 символов)';
  }
  if (['sell', 'rent'].includes(values.category)) {
    if (!values.price || isNaN(Number(values.price)) || Number(values.price) <= 0) {
      errors.price = 'Укажите корректную цену';
    }
  }
  if (!values.location || values.location.trim().length < 2) {
    errors.location = 'Укажите место (минимум 2 символа)';
  }
  if (!values.contact_phone || !isPhone(values.contact_phone)) {
    errors.contact_phone = 'Укажите телефон (от 7 до 11 цифр)';
  }
  if (values.main_image && !isImageFile(values.main_image)) {
    errors.main_image = 'Файл должен быть изображением (jpg, png и т.п.)';
  }
  if (values.images && values.images.length > 0) {
    if (values.images.length > 6) {
      errors.images = 'Максимум 6 изображений';
    } else if (
      values.images.some((file) => !isImageFile(file))
    ) {
      errors.images = 'Все файлы должны быть изображениями (jpg, png и т.п.)';
    }
  }
  if (values.images && values.images.length > 6) {
    errors.images = 'Максимум 6 изображений';
  }

  return errors;
}
