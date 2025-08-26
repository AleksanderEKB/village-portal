// front/src/shared/utils/httpError.ts
import type { AxiosError } from 'axios';

export type HttpErrorPayload = {
  status?: number;
  message?: string;
};

export function pickMessageFromData(data: any): string | undefined {
  if (!data) return undefined;
  if (typeof data === 'string') return data;
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.error === 'string') return data.error;
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
    return String(data.non_field_errors[0]);
  }
  return undefined;
}

/**
 * Унифицированный экстрактор статуса и сообщения из ошибок Axios/Fetch.
 * Никаких toast внутри — только извлечение данных.
 */
export function extractHttpError(e: unknown): HttpErrorPayload {
  // Axios-ветка
  const maybeAxios = e as AxiosError | any;
  if (maybeAxios?.isAxiosError) {
    const status = maybeAxios?.response?.status as number | undefined;
    const message =
      pickMessageFromData(maybeAxios?.response?.data) ??
      (typeof status === 'number' ? defaultMessageByStatus(status) : undefined);
    return { status, message };
  }

  // Fetch-ветка (если прокинули сам Response наружу)
  if (typeof Response !== 'undefined' && e instanceof Response) {
    const status = e.status;
    // Сообщение парсится наверху (в месте, где бросают), тут fallback:
    const message = defaultMessageByStatus(status);
    return { status, message };
  }

  // Fallback
  return { message: (e as any)?.message ?? 'Неизвестная ошибка' };
}

function defaultMessageByStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Некорректный запрос';
    case 401:
      return 'Не авторизованы';
    case 403:
      return 'Недостаточно прав';
    case 404:
      return 'Не найдено';
    case 413:
      return 'Слишком большой запрос';
    case 429:
      return 'Слишком много запросов. Попробуйте позже.';
    case 500:
      return 'Внутренняя ошибка сервера';
    case 502:
      return 'Плохой шлюз';
    case 503:
      return 'Сервис временно недоступен';
    default:
      return 'Ошибка запроса';
  }
}
