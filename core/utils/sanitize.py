# core/utils/sanitize.py

from typing import Optional, Iterable
from html.parser import HTMLParser
import html
import re

__all__ = [
    "sanitize_html",
    "strip_all_html",
    "_SAFE_TAGS",
    "_SAFE_ATTRS",
]

_SAFE_TAGS: set[str] = {
    "b", "strong", "i", "em", "u", "s",
    "p", "br", "ul", "ol", "li",
    "blockquote", "code", "pre",
    "span", "a",
}

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

_ALLOWED_URI_SCHEMES = ("http:", "https:", "mailto:", "tel:")

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
    if v.startswith(("/", "./", "../", "#")):
        return True
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
                safe_attrs.append((name, html.escape(value, quote=True) if value is not None else ""))

        if tag == "a":
            tgt = dict(safe_attrs).get("target", "")
            if tgt == "_blank":
                rel_val = dict(safe_attrs).get("rel", "")
                rel_parts = set(rel_val.split()) if rel_val else set()
                rel_parts.update({"noopener", "noreferrer"})
                safe_attrs = [(k, v) for (k, v) in safe_attrs if k != "rel"]
                safe_attrs.append(("rel", " ".join(sorted(rel_parts))))

        attrs_str = " " + " ".join(f'{k}="{v}"' for (k, v) in safe_attrs) if safe_attrs else ""
        self.result.append(f"<{tag}{attrs_str}>")
        if tag != "br":
            self._open_tags_stack.append(tag)

    def handle_endtag(self, tag: str):
        if tag in self.allowed_tags and tag in self._open_tags_stack:
            for i in range(len(self._open_tags_stack) - 1, -1, -1):
                if self._open_tags_stack[i] == tag:
                    del self._open_tags_stack[i]
                    self.result.append(f"</{tag}>")
                    break

    def handle_data(self, data: str):
        self.result.append(html.escape(data))

    def handle_entityref(self, name: str):
        self.result.append(f"&{name};")

    def handle_charref(self, name: str):
        self.result.append(f"&#{name};")

    def handle_comment(self, data: str):
        return

    def close(self) -> str:
        super().close()
        while self._open_tags_stack:
            tag = self._open_tags_stack.pop()
            self.result.append(f"</{tag}>")
        return "".join(self.result)

    def _is_attr_allowed(self, tag: str, name: str, value: Optional[str]) -> bool:
        if _JS_EVENT_ATTR_RE.match(name) or name.lower() == "style":
            return False
        allowed = self.allowed_attrs.get(tag, set())
        if name not in allowed:
            return False
        if tag == "a" and name == "href":
            return _is_safe_href(value or "")
        return True


def sanitize_html(html_input: str) -> str:
    if not html_input:
        return ""
    parser = _SafeHTMLParser(_SAFE_TAGS, _SAFE_ATTRS)
    normalized = html_input.replace("\r\n", "\n").replace("\r", "\n")
    parser.feed(normalized)
    return parser.close()


def strip_all_html(html_input: str) -> str:
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
