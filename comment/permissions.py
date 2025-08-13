# comment/permissions.py
from django.conf import settings
from rest_framework.permissions import BasePermission, SAFE_METHODS


def _allow_post_author_delete() -> bool:
    # фича-флаг, по умолчанию False (строгая модель)
    return bool(getattr(settings, "COMMENTS_ALLOW_POST_AUTHOR_DELETE", False))


class CommentAuthorOrReadOnly(BasePermission):
    """
    SAFE: всем.
    PUT/PATCH: только автор комментария или суперпользователь.
    DELETE:
      - если COMMENTS_ALLOW_POST_AUTHOR_DELETE=True:
            автор комментария, автор поста или суперпользователь
      - иначе: только автор комментария или суперпользователь
    """
    message = "Недостаточно прав для изменения или удаления этого комментария."

    def has_permission(self, request, view):
        # Разрешаем доступ к вью, объектные права — ниже
        return True

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        user = request.user
        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        # Редактировать: только автор комментария
        if request.method in ("PUT", "PATCH"):
            return obj.author_id == user.id

        # Удаление
        if request.method == "DELETE":
            if obj.author_id == user.id:
                return True
            if _allow_post_author_delete():
                # мягкая модель модерации: автор поста тоже может удалять
                return obj.post.author_id == user.id
            return False

        return False
