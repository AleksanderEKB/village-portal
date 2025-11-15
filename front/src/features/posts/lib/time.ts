// front/src/features/posts/lib/time.ts
export function formatRelativeTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 60) return `${diffMin} мин назад`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `${hours} ч назад`;
  return d.toLocaleDateString('ru-RU');
}
