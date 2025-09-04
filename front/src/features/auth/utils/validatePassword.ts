// front/src/features/auth/utils/validatePassword.ts
export type PasswordStrength = 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';

export type PasswordHint = {
  id:
    | 'minLength'
    | 'maxLength'
    | 'lower'
    | 'upper'
    | 'digit'
    | 'special'
    | 'noSpaces'
    | 'notCommon'
    | 'notPersonal'
    | 'noSequences'
    | 'noRepeat';
  label: string;
  ok: boolean;
};

export type PasswordValidationResult = {
  error: string | null;           // Главная ошибка (для тултипа/инпута). Если null — базовые требования выполнены
  hints: PasswordHint[];          // Список подсказок с прогрессом
  score: number;                  // 0..4
  strength: PasswordStrength;     // словесная оценка
};

export type ValidatePasswordOptions = {
  minLength?: number;         // по умолчанию 10
  maxLength?: number;         // по умолчанию 128
  forbidCommon?: boolean;     // запрещать слишком распространённые пароли
  userInputs?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  };
};

const COMMON_PASSWORDS = new Set<string>([
  // короткий список самых частых/легких
  'password', 'password1', 'passw0rd',
  '123456', '1234567', '12345678', '123456789', '1234567890', 'qwerty',
  '111111', '000000', 'abc123', 'iloveyou', 'welcome', 'admin', 'letmein',
  'qwerty123', '1q2w3e4r', 'monkey', 'dragon'
]);

const hasLower = (s: string) => /[a-zа-яё]/.test(s);
const hasUpper = (s: string) => /[A-ZА-ЯЁ]/.test(s);
const hasDigit = (s: string) => /\d/.test(s);
// Разрешим распространённые знаки препинания/символы
const hasSpecial = (s: string) => /[~`!@#$%^&*()_\-+={}$$$$|\\:;"'<>,.?/]/.test(s);
const hasSpaces = (s: string) => /\s/.test(s);

// повторяющиеся одинаковые символы длинной серией
const hasLongRepeat = (s: string, n = 4) => {
  if (!s) return false;
  let run = 1;
  for (let i = 1; i < s.length; i++) {
    if (s[i] === s[i - 1]) {
      run += 1;
      if (run >= n) return true;
    } else {
      run = 1;
    }
  }
  return false;
};

// монотонные последовательности (возрастающие/убывающие) длиной >= 4, например 1234, abcd, йклм
const hasSequential = (s: string, n = 4) => {
  if (!s) return false;
  const code = (c: string) => c.codePointAt(0) ?? 0;

  let inc = 1; // возрастающая
  let dec = 1; // убывающая
  for (let i = 1; i < s.length; i++) {
    const diff = code(s[i]) - code(s[i - 1]);
    if (diff === 1) {
      inc += 1; dec = 1;
    } else if (diff === -1) {
      dec += 1; inc = 1;
    } else {
      inc = 1; dec = 1;
    }
    if (inc >= n || dec >= n) return true;
  }
  return false;
};

const normalize = (s?: string) => (s ?? '').trim().toLowerCase();

function containsPersonal(password: string, inputs?: ValidatePasswordOptions['userInputs']): boolean {
  if (!inputs) return false;
  const p = normalize(password);
  const parts: string[] = [];
  if (inputs.email) {
    const e = normalize(inputs.email);
    parts.push(e);
    const local = e.split('@')[0];
    if (local) parts.push(local);
  }
  if (inputs.firstName) parts.push(normalize(inputs.firstName));
  if (inputs.lastName) parts.push(normalize(inputs.lastName));
  if (inputs.username) parts.push(normalize(inputs.username));

  // длиннее 2 символов, чтобы не триггерить по случайным биграммам
  return parts.some((x) => x.length >= 3 && p.includes(x));
}

function estimateScore(password: string, hints: PasswordHint[]): number {
  // База: 0..4
  // +1 за длину >= 12, +1 за полный набор классов, -1 за последовательности/повторы/личные/общие
  let score = 0;

  const ok = (id: PasswordHint['id']) => hints.find((h) => h.id === id)?.ok;

    if (password.length >= 10) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1; // Новый бонус за очень длинный пароль
    if (ok('lower') && ok('upper') && ok('digit') && ok('special')) score += 1;

    if (!ok('noSequences')) score -= 1;
    if (!ok('noRepeat')) score -= 1;
    if (!ok('notPersonal')) score -= 1;
    if (!ok('notCommon')) score -= 1;

    // приводим к диапазону 0..4
    return Math.max(0, Math.min(4, score));
}

function scoreToStrength(score: number): PasswordStrength {
  switch (score) {
    case 0: return 'very-weak';
    case 1: return 'weak';
    case 2: return 'medium';
    case 3: return 'strong';
    case 4: return 'very-strong';
    default: return 'weak';
  }
}

export function validatePassword(
  password: string,
  opts: ValidatePasswordOptions = {}
): PasswordValidationResult {
  const {
    minLength = 10,
    maxLength = 128,
    forbidCommon = true,
    userInputs
  } = opts;

  const tooShort = password.length < minLength;
  const tooLong = password.length > maxLength;

  const hints: PasswordHint[] = [
    {
      id: 'minLength',
      label: `Минимум ${minLength} символов`,
      ok: !tooShort
    },
    {
      id: 'maxLength',
      label: `Не длиннее ${maxLength} символов`,
      ok: !tooLong
    },
    {
      id: 'lower',
      label: 'Строчные буквы (a–z/а–я)',
      ok: hasLower(password)
    },
    {
      id: 'upper',
      label: 'Прописные буквы (A–Z/А–Я)',
      ok: hasUpper(password)
    },
    {
      id: 'digit',
      label: 'Цифры (0–9)',
      ok: hasDigit(password)
    },
    {
      id: 'special',
      label: 'Спецсимволы (~!@#$%^&* ...)',
      ok: hasSpecial(password)
    },
    {
      id: 'noSpaces',
      label: 'Без пробелов',
      ok: !hasSpaces(password)
    },
    {
      id: 'notCommon',
      label: 'Не из списка лёгких паролей',
      ok: !(
        forbidCommon &&
        COMMON_PASSWORDS.has(password.toLowerCase())
      )
    },
    {
      id: 'notPersonal',
      label: 'Не содержит ваши имя/фамилию/e-mail',
      ok: !containsPersonal(password, userInputs)
    },
    {
      id: 'noSequences',
      label: 'Без последовательностей (например, 1234, abcd)',
      ok: !hasSequential(password, 4)
    },
    {
      id: 'noRepeat',
      label: 'Без длинных повторов символов (например, aaaa)',
      ok: !hasLongRepeat(password, 4)
    }
  ];

  // Главная ошибка — первое «критичное» нарушение
  let error: string | null = null;
  if (!password) {
    error = 'Введите пароль';
  } else if (tooShort) {
    error = `Минимальная длина пароля — ${minLength} символов`;
  } else if (tooLong) {
    error = `Пароль не должен превышать ${maxLength} символов`;
  } else if (!hasLower(password)) {
    error = 'Добавьте строчные буквы';
  } else if (!hasUpper(password)) {
    error = 'Добавьте прописные буквы';
  } else if (!hasDigit(password)) {
    error = 'Добавьте цифры';
  } else if (!hasSpecial(password)) {
    error = 'Добавьте спецсимволы';
  } else if (hasSpaces(password)) {
    error = 'Пробелы в пароле не допускаются';
  } else if (forbidCommon && COMMON_PASSWORDS.has(password.toLowerCase())) {
    error = 'Слишком простой пароль — выберите другой';
  } else if (containsPersonal(password, userInputs)) {
    error = 'Пароль не должен содержать ваши персональные данные';
  } else if (hasSequential(password, 4)) {
    error = 'Избегайте последовательностей вроде 1234 или abcd';
  } else if (hasLongRepeat(password, 4)) {
    error = 'Избегайте длинных повторов одного символа';
  }

  const score = estimateScore(password, hints);
  const strength = scoreToStrength(score);

  return { error, hints, score, strength };
}
