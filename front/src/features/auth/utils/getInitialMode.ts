// front/src/features/auth/utils/getInitialMode.ts
import type { Location } from 'react-router-dom';

export type AuthMode = 'login' | 'register';

// Перегрузки для лучшей типизации:
export function getInitialMode(loc: Location): AuthMode;
export function getInitialMode(pathname: string): AuthMode;

// Реализация с объединённым типом:
export function getInitialMode(locOrPath: Location | string): AuthMode {
  const pathname = typeof locOrPath === 'string' ? locOrPath : locOrPath.pathname;
  // Логика определения режима — подправьте под свои роуты при необходимости
  if (pathname.includes('/register')) return 'register';
  return 'login';
}
