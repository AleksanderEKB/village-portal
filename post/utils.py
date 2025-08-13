# post/utils.py
# Оставляем всё, что связано с файлами/изображениями как было
# А HTML-саницию делаем общей и импортируем из common/sanitizers

from typing import Optional, Tuple
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import UploadedFile
import os

# === ИЗОБРАЖЕНИЯ (ваш прежний код без изменений) ===

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

def _validate_image_magic(upload: UploadedFile) -> tuple[str, str]:
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

# === HTML/XSS (теперь из общего модуля) ===
from common.sanitizers import sanitize_html, strip_all_html  # re-export для обратной совместимости

__all__ = [
    "validate_image_upload",
    "delete_file_safely",
    "sanitize_html",
    "strip_all_html",
]
