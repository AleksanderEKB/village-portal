# core/posts/utils.py
import re

def make_excerpt(text: str, limit: int = 100) -> str:
    """
    Возвращает укороченную версию текста:
    - сжимает повторяющиеся пробелы
    - режет по границе слова в пределах limit
    - добавляет многоточие, если обрезали
    """
    if not text:
        return ""
    s = re.sub(r"\s+", " ", text).strip()
    if len(s) <= limit:
        return s

    head = s[:limit]
    cut = head.rfind(" ")
    head = head if cut == -1 else head[:cut]
    return head.rstrip() + "…"
