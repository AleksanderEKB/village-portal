# core/utils/clean.py
import bleach

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return text
    return bleach.clean(text, tags=[], strip=True)
