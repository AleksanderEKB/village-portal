// front/src/features/auth/utils/validateAvatar.ts
export function isImageFile(file: File | null): boolean {
  if (!file) return false;
  return file.type.startsWith('image/');
}

export function validateAvatar(file: File | null): string | undefined {
  if (!file) return undefined; // Аватар опционален
  if (!isImageFile(file)) {
    return '                                                                                                     является изображением';
  }
  // Можно добавить ограничения по размеру, например 3 МБ:
  const MAX_SIZE = 3 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return 'Размер файла превышает 3 МБ';
  }
  return undefined;
}
