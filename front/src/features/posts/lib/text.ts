// front/src/features/posts/lib/text.ts

/**
 * Клиентский фолбэк — на случай, если short_content ещё не приходит с API.
 */
export function truncateSmart(input: string, max = 100): string {
  const s = (input ?? '').trim();
  if (s.length <= max) return s;
  const sub = s.slice(0, max);
  const space = sub.lastIndexOf(' ');
  const head = (space > 0 ? sub.slice(0, space) : sub).trimEnd();
  return head + '…';
}
