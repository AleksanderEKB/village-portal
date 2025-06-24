// frontend/src/features/shared/utils/pafination.tsx
import { useMemo } from 'react';

//  Возвращает номера страниц для умной пагинации
export function getSmartPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 1) return [1];
  let pages: (number | string)[] = [1];

  if (current > 3) pages.push('...');
  if (current > 2) pages.push(current - 1);
  if (current !== 1 && current !== total) pages.push(current);
  if (current < total - 1) pages.push(current + 1);
  if (current < total - 2) pages.push('...');
  if (total !== 1) pages.push(total);

  return [...new Set(pages)];
}


//  React-хук для пагинации массива данных
export function usePagination<T>(data: T[], page: number, itemsPerPage: number) {
  const totalPages = useMemo(
    () => Math.ceil(data.length / itemsPerPage),
    [data.length, itemsPerPage]
  );
  const startIdx = (page - 1) * itemsPerPage;
  const currentItems = useMemo(
    () => data.slice(startIdx, startIdx + itemsPerPage),
    [data, startIdx, itemsPerPage]
  );
  const pageNumbers = useMemo(
    () => getSmartPageNumbers(page, totalPages),
    [page, totalPages]
  );
  return { totalPages, currentItems, pageNumbers };
}
