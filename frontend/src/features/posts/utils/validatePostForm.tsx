// frontend/src/features/posts/utils/validatePostForm.ts
export type PostFormValues = {
  body: string;
  image: File | null;
  isEdit?: boolean;
  hasExistingImage?: boolean; // для режима редактирования, если на сервере уже есть картинка
};

export type PostFormValidationErrors = {
  body?: string;
  image?: string;
  [key: string]: string | undefined;
};

export function isImageFile(file: File | null): boolean {
  if (!file) return false;
  return file.type.startsWith('image/');
}

export function validatePostForm(values: PostFormValues): PostFormValidationErrors {
  const errors: PostFormValidationErrors = {};

  // Текст
  if (!values.body || values.body.trim().length < 1) {
    errors.body = 'Введите текст поста';
  }

  // Картинка:
  // - при создании: если файл выбран, он должен быть изображением
  // - при редактировании: допускаем отсутствие файла, если уже есть сохранённое изображение
  if (values.image && !isImageFile(values.image)) {
    errors.image = 'Файл не является изображением';
  }

  return errors;
}
