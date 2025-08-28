// front/src/features/auth/utils/validateAuthPage.ts

export function validateEmail(email: string): string | null {
  if (!email) return 'Введите email';
  // Локальная часть: любые не-пробельные и не-@ символы (Unicode)
  // Домен: латиница, цифры, дефис, точка, минимум 2 символа в TLD
  const emailRegex = /^[^\s@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/u;
  if (!emailRegex.test(email)) return 'Введите корректный email';
  return null;
}

export function validateFirstName(firstName: string): string | null {
  if (!firstName) return 'Введите имя';
  const nameRegex = /^[A-Za-zА-Яа-яЁё]+$/;
  if (!nameRegex.test(firstName)) return 'Имя должно содержать только буквы';
  return null;
}

export function validateLastName(lastName: string): string | null {
  if (!lastName) return 'Введите фамилию';
  const nameRegex = /^[A-Za-zА-Яа-яЁё]+$/;
  if (!nameRegex.test(lastName)) return 'Фамилия должна содержать только буквы';
  return null;
}
