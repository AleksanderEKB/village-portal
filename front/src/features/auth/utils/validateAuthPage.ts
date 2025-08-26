// front/src/features/auth/utils/validateAuthPage.ts
export function validateEmail(email: string): string | null {
  if (!email) return 'Введите email';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Введите корректный email';
  return null;
}
