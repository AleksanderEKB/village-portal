# post/utils.py
from typing import Optional, Tuple, Iterable
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import UploadedFile
from html.parser import HTMLParser
import html
import os
import re

# --- ВАЛИДАЦИЯ ИЗОБРАЖЕНИЙ (без изменений) ---

ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_IMAGE_MB = 5

def _sniff_image_type(header: bytes) -> Optional[str]:
    if len(header) < 12:
        return None
    if header[:3] == b"\xFF\xD8\xFF":
        return "jpeg"
    if header[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if header[:6] in (b"GIF87a", b"GIF89a"):
        return "gif"
    if header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        return "webp"
    return None

def _file_ext_lower(name: str) -> str:
    return os.path.splitext(name)[1].lower()

def _validate_image_ext(name: str) -> None:
    ext = _file_ext_lower(name)
    if ext not in ALLOWED_IMAGE_EXTS:
        raise ValidationError(
            f"Недопустимое расширение файла '{ext}'. Разрешено: {', '.join(sorted(ALLOWED_IMAGE_EXTS))}."
        )

def _validate_image_size(upload: UploadedFile) -> None:
    max_bytes = MAX_IMAGE_MB * 1024 * 1024
    if upload.size > max_bytes:
        raise ValidationError(
            f"Слишком большой файл ({upload.size // (1024 * 1024)} МБ). "
            f"Максимальный размер: {MAX_IMAGE_MB} МБ."
        )

def _validate_image_magic(upload: UploadedFile) -> Tuple[str, str]:
    pos = upload.file.tell() if hasattr(upload.file, "tell") else None
    try:
        if hasattr(upload, "open"):
            upload.open("rb")
        header = upload.read(64)
    finally:
        try:
            if hasattr(upload.file, "seek"):
                upload.file.seek(pos or 0)
        except Exception:
            pass

    detected = _sniff_image_type(header or b"")
    if not detected:
        raise ValidationError("Файл не является поддерживаемым изображением (jpeg/png/gif/webp).")

    ext = _file_ext_lower(upload.name)
    mapping = {
        "jpeg": {".jpg", ".jpeg"},
        "png": {".png"},
        "gif": {".gif"},
        "webp": {".webp"},
    }
    if ext not in mapping.get(detected, set()):
        raise ValidationError(
            f"Расширение файла {ext} не соответствует содержимому ({detected}). "
            "Переименуйте файл корректно или загрузите валидное изображение."
        )
    return detected, ext

def validate_image_upload(upload: UploadedFile) -> None:
    if upload is None:
        return
    _validate_image_ext(upload.name)
    _validate_image_size(upload)
    _validate_image_magic(upload)

# --- БЕЗОПАСНОЕ УДАЛЕНИЕ ФАЙЛОВ (без изменений) ---

def delete_file_safely(file_field) -> None:
    try:
        if not file_field:
            return
        storage = file_field.storage
        name = file_field.name
        if name and storage.exists(name):
            storage.delete(name)
    except Exception:
        pass

# --- ОЧИСТКА HTML/XSS (НОВОЕ) ---

_SAFE_TAGS: set[str] = {
    "b", "strong", "i", "em", "u", "s",
    "p", "br", "ul", "ol", "li",
    "blockquote", "code", "pre",
    "span",
    "a",
}
# Разрешённые атрибуты по тегам
_SAFE_ATTRS: dict[str, set[str]] = {
    "a": {"href", "title", "target", "rel"},
    "span": {"title"},
    "code": set(),
    "pre": set(),
    "p": set(),
    "b": set(),
    "strong": set(),
    "i": set(),
    "em": set(),
    "u": set(),
    "s": set(),
    "br": set(),
    "ul": set(),
    "ol": set(),
    "li": set(),
    "blockquote": set(),
}

# Разрешённые схемы ссылок
_ALLOWED_URI_SCHEMES = ("http:", "https:", "mailto:", "tel:")

# Признаки опасных инлайнов/URL
_JS_EVENT_ATTR_RE = re.compile(r"^on[a-z]+", re.IGNORECASE)
_DATA_URI_RE = re.compile(r"^\s*data:", re.IGNORECASE)
_JS_URI_RE = re.compile(r"^\s*javascript:", re.IGNORECASE)
_VB_URI_RE = re.compile(r"^\s*vbscript:", re.IGNORECASE)

def _is_safe_href(value: str) -> bool:
    v = value.strip().lower()
    if not v:
        return True
    if any(v.startswith(s) for s in _ALLOWED_URI_SCHEMES):
        return True
    if _JS_URI_RE.match(v) or _VB_URI_RE.match(v) or _DATA_URI_RE.match(v):
        return False
    # относительные ссылки /path, ./, ../ — ок
    if v.startswith(("/", "./", "../", "#")):
        return True
    # Прочее: запрещаем
    return False

class _SafeHTMLParser(HTMLParser):
    def __init__(self, allowed_tags: Iterable[str], allowed_attrs: dict[str, set[str]]):
        super().__init__(convert_charrefs=True)
        self.allowed_tags = set(allowed_tags)
        self.allowed_attrs = {k: set(v) for k, v in allowed_attrs.items()}
        self.result: list[str] = []
        self._open_tags_stack: list[str] = []

    def handle_starttag(self, tag: str, attrs):
        if tag not in self.allowed_tags:
            return
        safe_attrs = []
        for (name, value) in (attrs or []):
            if name is None:
                continue
            if self._is_attr_allowed(tag, name, value):
                # Экранируем значение
                safe_attrs.append((name, html.escape(value, quote=True) if value is not None else ""))

        # Спец-обработка <a>: чиним rel/target
        if tag == "a":
            # Если есть target=_blank — обязательно rel="noopener noreferrer"
            tgt = dict(safe_attrs).get("target", "")
            if tgt == "_blank":
                rel_val = dict(safe_attrs).get("rel", "")
                rel_parts = set(rel_val.split()) if rel_val else set()
                rel_parts.update({"noopener", "noreferrer"})
                # заменяем/добавляем rel
                safe_attrs = [(k, v) for (k, v) in safe_attrs if k != "rel"]
                safe_attrs.append(("rel", " ".join(sorted(rel_parts))))

        # Сборка тега
        if safe_attrs:
            attrs_str = " " + " ".join(f'{k}="{v}"' for (k, v) in safe_attrs)
        else:
            attrs_str = ""
        self.result.append(f"<{tag}{attrs_str}>")
        # Самозакрывающиеся у нас только br
        if tag != "br":
            self._open_tags_stack.append(tag)

    def handle_endtag(self, tag: str):
        if tag in self.allowed_tags and tag in self._open_tags_stack:
            # Закрываем только если реально открыт
            # Удаляем последнее вхождение из стека
            for i in range(len(self._open_tags_stack) - 1, -1, -1):
                if self._open_tags_stack[i] == tag:
                    del self._open_tags_stack[i]
                    self.result.append(f"</{tag}>")
                    break

    def handle_data(self, data: str):
        # Текст всегда экранируем
        self.result.append(html.escape(data))

    def handle_entityref(self, name: str):
        # Пропускаем как есть валидные именованные сущности
        self.result.append(f"&{name};")

    def handle_charref(self, name: str):
        self.result.append(f"&#{name};")

    def handle_comment(self, data: str):
        # Комментарии вырезаем
        return

    def close(self) -> str:
        super().close()
        # Закрываем «забытые» открытые теги в корректном порядке
        while self._open_tags_stack:
            tag = self._open_tags_stack.pop()
            self.result.append(f"</{tag}>")
        return "".join(self.result)

    def _is_attr_allowed(self, tag: str, name: str, value: Optional[str]) -> bool:
        # Запрет on* обработчиков и style
        if _JS_EVENT_ATTR_RE.match(name) or name.lower() == "style":
            return False
        # Только оговорённые атрибуты для тега
        allowed = self.allowed_attrs.get(tag, set())
        if name not in allowed:
            return False
        if tag == "a" and name == "href":
            return _is_safe_href(value or "")
        return True

def sanitize_html(html_input: str) -> str:
    """
    Очищает HTML: пропускает только белый список тегов/атрибутов,
    удаляет скрипты/ивенты/опасные URI, экранирует «голый» текст.
    """
    if not html_input:
        return ""
    parser = _SafeHTMLParser(_SAFE_TAGS, _SAFE_ATTRS)
    # Важный момент: сначала лёгкая нормализация переносов
    normalized = html_input.replace("\r\n", "\n").replace("\r", "\n")
    parser.feed(normalized)
    return parser.close()

def strip_all_html(html_input: str) -> str:
    """
    Полностью удаляет все теги и возвращает только текст (экранированный).
    Оставлено «на всякий» для других мест использования.
    """
    if not html_input:
        return ""
    class _Stripper(HTMLParser):
        def __init__(self):
            super().__init__(convert_charrefs=True)
            self.out: list[str] = []
        def handle_data(self, data: str):
            self.out.append(html.escape(data))
        def handle_entityref(self, name: str):
            self.out.append(f"&{name};")
        def handle_charref(self, name: str):
            self.out.append(f"&#{name};")
    s = _Stripper()
    s.feed(html_input)
    s.close()
    return "".join(s.out)
