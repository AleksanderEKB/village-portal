// front/src/features/shared/utils/validateFile.ts

/**
 * Проверка, что File — изображение (по MIME).
 */
export function isImageFile(file: File | null | undefined): boolean {
  return !!file && typeof file.type === 'string' && file.type.startsWith('image/');
}

/**
 * Универсальная валидация "файл — изображение".
 * - Разрешает "отсутствие файла" (возвращает true).
 * - Если файл не изображение — вызывает onError (если передан) и возвращает false.
 */
export function validateImageFile(
  file: File | null | undefined,
  onError?: (msg: string) => void
): boolean {
  if (!file) return true;
  if (!isImageFile(file)) {
    onError?.('Файл не является изображением');
    return false;
  }
  return true;
}
